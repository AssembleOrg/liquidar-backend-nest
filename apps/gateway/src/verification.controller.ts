import { Controller, Get, Query, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Controller()
@ApiTags('verification')
export class VerificationController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Get('verify')
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
    try {
      return await firstValueFrom(
        this.authClient.send('auth.verify-email', token).pipe(
          catchError((error) => {
            throw error;
          })
        )
      );
    } catch (error) {
      // Handle error appropriately
      if (error && typeof error === 'object' && error.status === 'error') {
        const errorMessage = error.message || 'Email verification failed';
        const errorCode = error.code || 400;
        
        if (errorCode === 400) {
          throw new Error(errorMessage);
        }
      }
      
      throw new Error('Email verification failed');
    }
  }
} 