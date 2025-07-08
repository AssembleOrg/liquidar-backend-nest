import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailService } from './services/email.service';
import { HttpService } from './services/http.service';
import { configValidationSchema } from './config/validation.schema';
import emailConfig from './config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [emailConfig],
      envFilePath: 'apps/notifications/.env',
      cache: false,
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, HttpService],
})
export class AppModule {} 