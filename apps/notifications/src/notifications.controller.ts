import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { SendVerificationEmailDto, SendWelcomeEmailDto } from './dto/send-email.dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('notifications.sendVerificationEmail')
  async sendVerificationEmail(@Payload() data: SendVerificationEmailDto) {
    try {
      const { email, firstName, verificationToken } = data;
      await this.notificationsService.sendVerificationEmail(email, firstName, verificationToken);
      return { status: 'success', message: 'Verification email sent successfully' };
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error sending verification email',
        code: error.status || 500
      };
    }
  }

  @MessagePattern('notifications.sendWelcomeEmail')
  async sendWelcomeEmail(@Payload() data: SendWelcomeEmailDto) {
    try {
      const { email, firstName } = data;
      await this.notificationsService.sendWelcomeEmail(email, firstName);
      return { status: 'success', message: 'Welcome email sent successfully' };
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error sending welcome email',
        code: error.status || 500
      };
    }
  }
} 