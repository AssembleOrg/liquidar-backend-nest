import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreatePreferenceRequest {
  amount: number;
  currency: string;
  description: string;
  installments: number;
  userId?: string;
  external_reference?: string;
}

export interface MercadoPagoPreference {
  preference_id: string;
  // init_point: string;
  // sandbox_init_point: string;
  // client_id: string;
  // collector_id: number;
  // operation_type: string;
  // items: Array<{
  //   id: string;
  //   title: string;
  //   description: string;
  //   quantity: number;
  //   unit_price: number;
  //   currency_id: string;
  // }>;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  client_id: string;
  collector_id: number;
  operation_type: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
}


export interface PaymentNotification {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly accessToken: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN') || '';
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    this.baseUrl = isProduction 
      ? 'https://api.mercadopago.com' 
      : 'https://api.mercadopago.com'; // MercadoPago usa la misma URL para sandbox
    
    if (!this.accessToken) {
      this.logger.warn('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }
  }

  async createPreference(data: CreatePreferenceRequest): Promise<MercadoPagoPreference> {
    try {
      this.logger.log(`Creando preferencia de pago: ${JSON.stringify(data)}`);

      const preferenceData = {
        items: [
          {
            title: data.description,
            description: data.description,
            quantity: 1,
            unit_price: data.amount,
            currency_id: data.currency || 'ARS',
          },
        ],
        payment_methods: {
          installments: data.installments || 1,
          excluded_payment_methods: [
            // Puedes excluir métodos de pago específicos aquí
          ],
          excluded_payment_types: [
            // Puedes excluir tipos de pago específicos aquí
          ],
        },
        back_urls: {
          success: this.configService.get<string>('MERCADOPAGO_SUCCESS_URL', 'http://localhost:3000/payment/success'),
          failure: this.configService.get<string>('MERCADOPAGO_FAILURE_URL', 'http://localhost:3000/payment/failure'),
          pending: this.configService.get<string>('MERCADOPAGO_PENDING_URL', 'http://localhost:3000/payment/pending'),
        },
        // auto_return: 'approved',
        external_reference: data.external_reference || `liquidar_${Date.now()}`,
        notification_url: this.configService.get<string>('MERCADOPAGO_WEBHOOK_URL'),
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      };

      const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Error creando preferencia MercadoPago: ${response.status} - ${errorText}`);
        throw new Error(`Error creando preferencia: ${response.status} - ${errorText}`);
      }

      const preference = await response.json() as MercadoPagoPreferenceResponse;
      this.logger.log(`Preferencia creada exitosamente: ${JSON.stringify(preference)}`);

      return {
        preference_id: preference.id,
      };
    } catch (error) {
      this.logger.error('Error en createPreference:', error);
      throw new Error(`Error creando preferencia de MercadoPago: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      this.logger.log(`Obteniendo estado del pago: ${paymentId}`);

      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Error obteniendo estado del pago: ${response.status} - ${errorText}`);
        throw new Error(`Error obteniendo estado del pago: ${response.status}`);
      }

      const payment = await response.json() as any;
      this.logger.log(`Estado del pago obtenido: ${payment.status}`);

      return payment;
    } catch (error) {
      this.logger.error('Error en getPaymentStatus:', error);
      throw new Error(`Error obteniendo estado del pago: ${error.message}`);
    }
  }

  async processWebhook(notification: PaymentNotification): Promise<any> {
    try {
      this.logger.log(`Procesando webhook de MercadoPago: ${JSON.stringify(notification)}`);

      if (notification.type === 'payment') {
        const paymentStatus = await this.getPaymentStatus(notification.data.id);
        
        // Aquí puedes agregar lógica adicional para procesar el estado del pago
        // Por ejemplo, actualizar el estado en tu base de datos
        
        return {
          status: 'processed',
          payment_id: notification.data.id,
          payment_status: paymentStatus.status,
        };
      }

      return {
        status: 'ignored',
        type: notification.type,
      };
    } catch (error) {
      this.logger.error('Error procesando webhook:', error);
      throw new Error(`Error procesando webhook: ${error.message}`);
    }
  }
}
