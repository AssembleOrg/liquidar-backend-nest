import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateCheckoutBricksPreferenceRequest {
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  payer: {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  external_reference?: string;
  expiration_date?: string;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url?: string;
  payment_methods?: {
    installments?: number;
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
  };
  additional_info?: {
    items?: any[];
    payer?: any;
    shipments?: any;
  };
}

export interface CheckoutBricksPreference {
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
  payer: {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url: string;
  external_reference: string;
  expires: boolean;
  expiration_date_from: string;
  expiration_date_to: string;
}

export interface CheckoutBricksPayment {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  description: string;
  date_created: string;
  date_approved?: string;
  payment_method_id: string;
  payment_type_id: string;
  external_reference: string;
  payer: {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  payment_method: {
    id: string;
    type: string;
    issuer_id?: string;
  };
  installments: {
    quantity: number;
    amount: number;
    rate: number;
    currency_id: string;
  };
}

export interface CheckoutBricksWebhookNotification {
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
export class CheckoutBricksService {
  private readonly logger = new Logger(CheckoutBricksService.name);
  private readonly accessToken: string;
  private readonly baseUrl: string;
  private readonly publicKey: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('CHECKOUTBRICKS_ACCESS_TOKEN') || '';
    this.publicKey = this.configService.get<string>('CHECKOUTBRICKS_PUBLIC_KEY') || '';
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    this.baseUrl = isProduction 
      ? 'https://api.mercadopago.com' 
      : 'https://api.mercadopago.com'; // CheckoutBricks usa la misma URL de MercadoPago
    
    if (!this.accessToken) {
      this.logger.warn('CHECKOUTBRICKS_ACCESS_TOKEN no configurado');
    }
    if (!this.publicKey) {
      this.logger.warn('CHECKOUTBRICKS_PUBLIC_KEY no configurado');
    }
  }

  async createPreference(data: CreateCheckoutBricksPreferenceRequest): Promise<CheckoutBricksPreference> {
    try {
      this.logger.log(`Creando preferencia de CheckoutBricks: ${JSON.stringify(data)}`);

      const preferenceData = {
        items: data.items.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || 'ARS',
        })),
        payer: {
          name: data.payer.name,
          surname: data.payer.surname,
          email: data.payer.email,
          phone: data.payer.phone,
          identification: data.payer.identification,
        },
        payment_methods: {
          installments: data.payment_methods?.installments || 1,
          excluded_payment_methods: data.payment_methods?.excluded_payment_methods || [],
          excluded_payment_types: data.payment_methods?.excluded_payment_types || [],
        },
        back_urls: data.back_urls || {
          success: this.configService.get<string>('CHECKOUTBRICKS_SUCCESS_URL', 'http://localhost:3000/payment/success'),
          failure: this.configService.get<string>('CHECKOUTBRICKS_FAILURE_URL', 'http://localhost:3000/payment/failure'),
          pending: this.configService.get<string>('CHECKOUTBRICKS_PENDING_URL', 'http://localhost:3000/payment/pending'),
        },
        auto_return: 'approved',
        external_reference: data.external_reference || `liquidar_${Date.now()}`,
        notification_url: data.notification_url || this.configService.get<string>('CHECKOUTBRICKS_WEBHOOK_URL'),
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: data.expiration_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas por defecto
        additional_info: data.additional_info,
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
        this.logger.error(`Error creando preferencia CheckoutBricks: ${response.status} - ${errorText}`);
        throw new Error(`Error creando preferencia: ${response.status} - ${errorText}`);
      }

      const preference = await response.json() as CheckoutBricksPreference;
      this.logger.log(`Preferencia creada exitosamente: ${preference.id}`);

      return preference;
    } catch (error) {
      this.logger.error('Error en createPreference:', error);
      throw new Error(`Error creando preferencia de CheckoutBricks: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<CheckoutBricksPayment> {
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

      const payment = await response.json() as CheckoutBricksPayment;
      this.logger.log(`Estado del pago obtenido: ${payment.status}`);

      return payment;
    } catch (error) {
      this.logger.error('Error en getPaymentStatus:', error);
      throw new Error(`Error obteniendo estado del pago: ${error.message}`);
    }
  }

  async processWebhook(notification: CheckoutBricksWebhookNotification): Promise<any> {
    try {
      this.logger.log(`Procesando webhook de CheckoutBricks: ${JSON.stringify(notification)}`);

      if (notification.type === 'payment') {
        const paymentStatus = await this.getPaymentStatus(notification.data.id);
        
        // Aquí puedes agregar lógica adicional para procesar el estado del pago
        // Por ejemplo, actualizar el estado en tu base de datos
        
        return {
          status: 'processed',
          payment_id: notification.data.id,
          payment_status: paymentStatus.status,
          payment_detail: paymentStatus.status_detail,
          transaction_amount: paymentStatus.transaction_amount,
          currency_id: paymentStatus.currency_id,
          external_reference: paymentStatus.external_reference,
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

  getPublicKey(): string {
    return this.publicKey;
  }

  async getPaymentMethods(): Promise<any> {
    try {
      this.logger.log('Obteniendo métodos de pago disponibles');

      const response = await fetch(`${this.baseUrl}/v1/payment_methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Error obteniendo métodos de pago: ${response.status} - ${errorText}`);
        throw new Error(`Error obteniendo métodos de pago: ${response.status}`);
      }

      const paymentMethods = await response.json() as any[];
      this.logger.log(`Métodos de pago obtenidos: ${paymentMethods.length} métodos`);

      return paymentMethods;
    } catch (error) {
      this.logger.error('Error en getPaymentMethods:', error);
      throw new Error(`Error obteniendo métodos de pago: ${error.message}`);
    }
  }
} 