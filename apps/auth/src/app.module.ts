import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { configValidationSchema } from './config/validation.schema';
import { NotificationsService } from './services/notifications.service';
import { VerificationService } from './services/verification.service';
import { GoogleAuthService } from './services/google-auth.service';
import { UserModule } from './user.module';
import { MicroserviceErrorsModule } from '@shared/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env',
      validationSchema: configValidationSchema,
      cache: false,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('AUTH_POSTGRES_URL');
        const nodeEnv = configService.get('NODE_ENV');
        
        return {
          type: 'postgres',
          url: dbUrl,
          ssl: nodeEnv === 'production' ? {
            rejectUnauthorized: false,
          } : false,
          entities: [User],
          synchronize: false, // Usar migraciones en lugar de synchronize
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') 
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: 'GENERAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GENERAL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.GENERAL_SERVICE_PORT || '3003'),
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATIONS_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.NOTIFICATIONS_SERVICE_PORT || '3004'),
        },
      },
    ]),
    UserModule,
    MicroserviceErrorsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    NotificationsService,
    VerificationService,
    GoogleAuthService,
    {
      provide: 'JWT_SECRET',
      useFactory: (configService: ConfigService) => configService.get<string>('JWT_SECRET'),
      inject: [ConfigService],
    },
  ],
})
export class AppModule {} 