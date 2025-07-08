import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerificationController } from '../verification.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST ?? 'localhost',
          port: parseInt(process.env.AUTH_SERVICE_PORT ?? '3001'),
        },
      }
    ]),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_SERVICE_HOST', 'localhost'),
            port: configService.get('AUTH_SERVICE_PORT', 3001),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController, VerificationController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {} 