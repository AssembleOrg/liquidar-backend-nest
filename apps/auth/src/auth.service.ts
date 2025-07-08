import { Injectable, UnauthorizedException, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { NotificationsService } from './services/notifications.service';
import { VerificationService } from './services/verification.service';
import { GoogleAuthService, GoogleUserInfo } from './services/google-auth.service';
import { RegisterDto, LoginDto, GoogleLoginDto, CreateBillItemDto, BillItemResponseDto } from '@shared/dto';
import { MicroserviceErrorHandler, UserRole } from '@shared/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
    billItems: Record<string, any>[];
    provider?: string;
  };
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private verificationService: VerificationService,
    private googleAuthService: GoogleAuthService,
    @Inject('GENERAL_SERVICE') private readonly generalService: ClientProxy,
    private readonly errorHandler: MicroserviceErrorHandler
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const normalizedEmail = email.toLowerCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      isVerified: false,
      lastSendVerificationEmail: new Date(),
      roles: [UserRole.USER],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'local',
    });


    const savedUser = await this.userRepository.save(user);

    // Generate verification token and send email
    const verificationToken = this.verificationService.generateVerificationToken(Number(savedUser.id), savedUser.email);

    try {
      console.log('Sending verification email to:', savedUser.email);
      await this.notificationsService.sendVerificationEmail(savedUser.email, savedUser.firstName, verificationToken);
    } catch (error) {
      // Log error but don't fail registration
      console.error('Error sending verification email:', error);
    }

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        roles: savedUser.roles,
        isVerified: savedUser.isVerified,
      },
      message: 'Usuario registrado exitosamente. Por favor verifica tu email para activar tu cuenta.',
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const normalizedEmail = email.toLowerCase();

    // Create a query runner for transaction management
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();

    try {
      // Start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Find user within transaction
      const user = await queryRunner.manager.findOne(User, { where: { email: normalizedEmail } });
      if (!user) {
        throw new RpcException({
          status: 'error',
          message: 'Usuario no encontrado. Por favor verifica tu email y contraseña.',
          code: 404
        })
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new RpcException({
          status: 'error',
          message: 'Contraseña incorrecta',
          code: 401
        })
      }

      // Check if user is active
      if (!user.isActive) {
        throw new RpcException({
          status: 'error',
          message: 'Cuenta de usuario desactivada',
          code: 401
        })
      }

      if (!user.isVerified) {
        await this.resendVerificationEmail(user.email);
        throw new RpcException({
          status: 'error',
          message: 'Cuenta no verificada. Se ha reenviado el email de verificación.',
          code: 401
        })
      }

      // Generate token
      const token = this.generateToken(user);

      // Commit transaction before external service call
      await queryRunner.commitTransaction();

      // Get bill items from general service (after DB transaction is committed)
      const getBillItems = await this.errorHandler.executeMicroserviceOperation(
        this.generalService,
        'bill-item.getBillItems',
        BillItemResponseDto,
        'Obteniendo Facturadores'
      );
      const billItems: BillItemResponseDto[] = getBillItems as BillItemResponseDto[];
      const sanitizedBillItems = billItems.map(billItem => {
        const { afipPassword, ...sanitizedItem } = billItem;
        return sanitizedItem;
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          billItems: sanitizedBillItems,
          provider: user.provider,
        },
        token,
      };

    } catch (error) {
      // Rollback transaction on any error
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      // Re-throw the error
      throw error;
      
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user || !user.isActive) {
        return null;
      }

      return {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      };
    } catch (error) {
      return null;
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = await this.verificationService.verifyToken(token);

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.isVerified) {
        return { message: 'La cuenta ya está verificada' };
      }

      // Update user as verified
      user.isVerified = true;
      await this.userRepository.save(user);

      // Send welcome email
      try {
        await this.notificationsService.sendWelcomeEmail(user.email, user.firstName);
      } catch (error) {
        console.error('Error sending welcome email:', error);
      }

      return { message: 'Email verificado exitosamente' };
    } catch (error) {
      throw new Error('Token de verificación inválido o expirado');
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.isVerified) {
      throw new Error('La cuenta ya está verificada');
    }

    // Check if we can resend (not too frequent)
    const now = new Date();
    const lastSend = user.lastSendVerificationEmail;
    const timeDiff = now.getTime() - lastSend.getTime();
    const minInterval = 10 * 60 * 1000; // 15 minutes

    if (timeDiff < minInterval) {
      throw new Error('Debes esperar al menos 10 minutos entre envíos de verificación');
    }

    // Generate new verification token
    const verificationToken = this.verificationService.generateVerificationToken(Number(user.id), user.email);

    // Update last send time
    user.lastSendVerificationEmail = now;
    await this.userRepository.save(user);

    // Send verification email
    await this.notificationsService.sendVerificationEmail(user.email, user.firstName, verificationToken);

    return { message: 'Email de verificación reenviado exitosamente' };
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }

  async googleLogin(googleLoginDto: GoogleLoginDto): Promise<LoginResponse> {
    const { googleToken } = googleLoginDto;

    try {
      // Verificar el token de Google
      const googleUserInfo = await this.googleAuthService.verifyGoogleToken(googleToken);
      
      const normalizedEmail = googleUserInfo.email.toLowerCase();

      // Buscar si el usuario ya existe
      let user = await this.userRepository.findOne({ 
        where: { email: normalizedEmail } 
      });

      if (user) {
        // Si el usuario existe pero no tiene googleId, actualizarlo
        if (!user.googleId) {
          user.googleId = googleUserInfo.googleId;
          user.provider = 'google';
          user.isVerified = true; // Los usuarios de Google están automáticamente verificados
          await this.userRepository.save(user);
        }
      } else {
        // Crear nuevo usuario con información de Google
        user = this.userRepository.create({
          email: normalizedEmail,
          firstName: googleUserInfo.firstName,
          lastName: googleUserInfo.lastName,
          googleId: googleUserInfo.googleId,
          provider: 'google',
          isVerified: true, // Los usuarios de Google están automáticamente verificados
          lastSendVerificationEmail: new Date(),
          roles: [UserRole.USER],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const savedUser = await this.userRepository.save(user);

        // Enviar email de bienvenida
        try {
          await this.notificationsService.sendWelcomeEmail(savedUser.email, savedUser.firstName);
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }

        user = savedUser;
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        throw new RpcException({
          status: 'error',
          message: 'Cuenta de usuario desactivada',
          code: 401
        });
      }

      // Generar token JWT
      const token = this.generateToken(user);

      // Obtener bill items del servicio general
      const getBillItems = await this.errorHandler.executeMicroserviceOperation(
        this.generalService,
        'bill-item.getBillItems',
        BillItemResponseDto,
        'Obteniendo Facturadores'
      );
      const billItems: BillItemResponseDto[] = getBillItems as BillItemResponseDto[];
      const sanitizedBillItems = billItems.map(billItem => {
        const { afipPassword, ...sanitizedItem } = billItem;
        return sanitizedItem;
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          billItems: sanitizedBillItems,
        },
        token,
      };

    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: 'error',
        message: error.message || 'Error en login con Google',
        code: 400
      });
    }
  }
}