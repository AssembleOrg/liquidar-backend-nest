import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService, LoginResponse } from './auth.service';
import { UserService } from './services/user.service';
import { LoginDto, RegisterDto, GoogleLoginDto } from '@shared/dto';

export interface ErrorResponse {
  status: 'error';
  message: string;
  code: number;
}

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) { }

  @MessagePattern('auth.login')
  async login(@Payload() loginDto: LoginDto): Promise<LoginResponse | ErrorResponse> {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Login failed',
        code: error.status || 400
      };
    }
  }

  @MessagePattern('auth.register')
  async register(@Payload() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Registration failed',
        code: error.status || 400
      };
    }
  }

  @MessagePattern('auth.validate')
  async validateToken(@Payload() token: string) {
    try {
      return await this.authService.validateToken(token);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Token validation failed',
        code: error.status || 400
      };
    }
  }

  @MessagePattern('auth.verify-email')
  async verifyEmail(@Payload() token: string) {
    try {
      return await this.authService.verifyEmail(token);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Email verification failed',
        code: error.status || 400
      };
    }
  }

  @MessagePattern('auth.resend-verification')

  async resendVerificationEmail(@Payload() email: string) {
    try {
      return await this.authService.resendVerificationEmail(email);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Resend verification failed',
        code: error.status || 400
      };
    }
  }

  @MessagePattern('user.bill-item')
  async addBillItemToUser(@Payload() { userId, billId }: { userId: string, billId: string }) {
    console.log("Handled by auth service")
    try {
      return await this.userService.addBillItemToUser(userId, billId);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error agregando bill item al usuario',
        code: error.status || 400
      };
    }
  }

  @MessagePattern('auth.google-login')
  async googleLogin(@Payload() googleLoginDto: GoogleLoginDto): Promise<LoginResponse | ErrorResponse> {
    try {
      return await this.authService.googleLogin(googleLoginDto);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Google login failed',
        code: error.status || 400
      };
    }
  }
}  