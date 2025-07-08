import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, GoogleLoginDto } from '@shared/dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
          },
        },
        token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Usuario ya existe' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
          },
        },
        token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token válido',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        email: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async validateToken(@Body() body: { token: string }) {
    return this.authService.validateToken(body.token);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email con token' })
  @ApiQuery({ name: 'token', description: 'Token de verificación', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verificado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }



  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar email de verificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email de verificación reenviado',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Email no encontrado o ya verificado' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' }
      }
    }
  })
  async resendVerificationEmail(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con Google' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login con Google exitoso',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
          },
        },
        token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token de Google inválido' })
  @ApiResponse({ status: 401, description: 'Error de autenticación' })
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    console.log('Google login DTO:', googleLoginDto);
    return this.authService.googleLogin(googleLoginDto);
  }
} 