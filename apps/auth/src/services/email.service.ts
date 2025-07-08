import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as brevo from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiInstanceEmail: brevo.TransactionalEmailsApi;
  private readonly sendSmtpEmail: brevo.SendSmtpEmail;

  constructor(private configService: ConfigService) {
    this.apiInstanceEmail = new brevo.TransactionalEmailsApi();
    this.apiInstanceEmail.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get<string>('email.brevoApiKey') || ''
    );
    this.sendSmtpEmail = new brevo.SendSmtpEmail();
  }

  async sendVerificationEmail(email: string, firstName: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('email.verificationUrl')}?token=${verificationToken}`;
    
    this.sendSmtpEmail.subject = 'Verifica tu cuenta - Liquidar';
    this.sendSmtpEmail.to = [
      {
        email: email,
        name: firstName,
      },
    ];

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 20px;">¡Bienvenido a LiquidAr!</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hola ${firstName}, gracias por registrarte en nuestra plataforma.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Para completar tu registro, por favor verifica tu cuenta haciendo clic en el siguiente botón:
          </p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verificar mi cuenta
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:
          </p>
          <p style="color: #007bff; font-size: 14px; word-break: break-all;">
            ${verificationUrl}
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            Este enlace expirará en 24 horas por seguridad.
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Si no solicitaste esta verificación, puedes ignorar este email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Liquidar. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    this.sendSmtpEmail.htmlContent = htmlContent;
    this.sendSmtpEmail.sender = {
      name: this.configService.get<string>('email.fromName') || 'Liquidar',
      email: this.configService.get<string>('email.fromEmail') || 'noreply@liquidar.com',
    };

    try {
      this.logger.log(`Attempting to send verification email to ${email}`);
      this.logger.log(`From: ${this.sendSmtpEmail.sender?.email} (${this.sendSmtpEmail.sender?.name})`);
      this.logger.log(`Subject: ${this.sendSmtpEmail.subject}`);
      this.logger.log(`Verification URL: ${verificationUrl}`);
      
      const result = await this.apiInstanceEmail.sendTransacEmail(this.sendSmtpEmail);
      this.logger.log(`Verification email sent successfully to ${email}`);
      this.logger.log(`Brevo response:`, result);
    } catch (error) {
      this.logger.error(`Error sending verification email to ${email}:`, error);
      this.logger.error(`Error details:`, {
        message: error.message,
        status: error.status,
        response: error.response?.data
      });
      throw new Error('Error al enviar correo electrónico de verificación');
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    this.sendSmtpEmail.subject = '¡Bienvenido a Liquidar!';
    this.sendSmtpEmail.to = [
      {
        email: email,
        name: firstName,
      },
    ];

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 20px;">¡Cuenta verificada exitosamente!</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hola ${firstName}, tu cuenta ha sido verificada correctamente.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Ya puedes acceder a todos los servicios de nuestra plataforma.
          </p>
          <div style="margin: 30px 0;">
            <a href="${this.configService.get<string>('email.verificationUrl')?.replace('/verify', '')}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Ir a la plataforma
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Liquidar. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    this.sendSmtpEmail.htmlContent = htmlContent;
    this.sendSmtpEmail.sender = {
      name: this.configService.get<string>('email.fromName') || 'Liquidar',
      email: this.configService.get<string>('email.fromEmail') || 'noreply@liquidar.com',
    };

    try {
      await this.apiInstanceEmail.sendTransacEmail(this.sendSmtpEmail);
      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${email}:`, error);
      throw new Error('Error al enviar correo electrónico de bienvenida');
    }
  }
} 