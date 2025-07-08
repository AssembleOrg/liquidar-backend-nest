import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly notificationsServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.notificationsServiceUrl = this.configService.get<string>('NOTIFICATIONS_SERVICE_URL') || 'http://localhost:3004';
    
    this.axiosInstance = axios.create({
      baseURL: this.notificationsServiceUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.log(`Making request to notifications service: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error to notifications service:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.log(`Response received from notifications service: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        this.logger.error('Response error from notifications service:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async sendVerificationEmail(email: string, firstName: string, verificationToken: string): Promise<void> {
    try {
      await this.axiosInstance.post('/notifications/send-verification-email', {
        email,
        firstName,
        verificationToken,
      });
      this.logger.log(`Verification email request sent successfully for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email request for ${email}:`, error);
      throw new Error('Error al enviar solicitud de correo electrónico de verificación');
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      await this.axiosInstance.post('/notifications/send-welcome-email', {
        email,
        firstName,
      });
      this.logger.log(`Welcome email request sent successfully for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email request for ${email}:`, error);
      throw new Error('Error al enviar solicitud de correo electrónico de bienvenida');
    }
  }
} 