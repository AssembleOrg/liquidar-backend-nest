import { Injectable } from '@nestjs/common';
import { EmailService } from './services/email.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly emailService: EmailService) {}

  async sendVerificationEmail(email: string, firstName: string, verificationToken: string): Promise<void> {
    return this.emailService.sendVerificationEmail(email, firstName, verificationToken);
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    return this.emailService.sendWelcomeEmail(email, firstName);
  }
} 