import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DolarService } from './services/dolar.service';
import { AfipService, ComprobanteRequest } from './services/afip.service';
import { VaultService } from './services/vault.service';
import { MercadoPagoService, CreatePreferenceRequest, PaymentNotification } from './services/mercadopago.service';
import { CheckoutBricksService, CreateCheckoutBricksPreferenceRequest, CheckoutBricksWebhookNotification } from './services/checkoutbricks.service';

@Controller()
export class ExternalController {
  constructor(
    private readonly dolarService: DolarService,
    private readonly afipService: AfipService,
    private readonly vaultService: VaultService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly checkoutBricksService: CheckoutBricksService,
  ) {}

  // ===== DOLAR ENDPOINTS =====
  @MessagePattern('external.dolar.blue')
  async obtenerDolarBlue() {
    try {
      return await this.dolarService.obtenerDolarActual();
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error obteniendo dólar blue',
        code: 400
      };
    }
  }

  // ===== AFIP ENDPOINTS =====
  @MessagePattern('external.afip.ultimo-comprobante')
  async obtenerUltimoComprobante(@Payload() data: { tipoComprobante: number; puntoVenta: number; userId: string }) {
    try {
      return await this.afipService.obtenerUltimoComprobante(data.tipoComprobante, data.puntoVenta, data.userId);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error obteniendo último comprobante',
        code: 400
      };
    }
  }

  @MessagePattern('external.afip.crear-comprobante')
  async crearComprobante(@Payload() data: { comprobanteData: ComprobanteRequest; userId: string, type: 'ticket' | 'factura' }) {
    try {
      return await this.afipService.crearComprobante(data.comprobanteData, data.userId, data.type);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error creando comprobante',
        code: 400
      };
    }
  }

  // ===== MERCADOPAGO ENDPOINTS =====
  @MessagePattern('external.mercadopago.create-preference')
  async createMercadoPagoPreference(@Payload() data: CreatePreferenceRequest) {
    try {
      return await this.mercadoPagoService.createPreference(data);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error creando preferencia de MercadoPago',
        code: 400
      };
    }
  }

  @MessagePattern('external.mercadopago.payment-status')
  async getMercadoPagoPaymentStatus(@Payload() paymentId: string) {
    try {
      return await this.mercadoPagoService.getPaymentStatus(paymentId);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error obteniendo estado del pago MercadoPago',
        code: 400
      };
    }
  }

  @MessagePattern('external.mercadopago.webhook')
  async processMercadoPagoWebhook(@Payload() notification: PaymentNotification) {
    try {
      return await this.mercadoPagoService.processWebhook(notification);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error procesando webhook de MercadoPago',
        code: 400
      };
    }
  }

  // ===== CHECKOUTBRICKS ENDPOINTS =====
  @MessagePattern('external.checkoutbricks.create-preference')
  async createCheckoutBricksPreference(@Payload() data: CreateCheckoutBricksPreferenceRequest) {
    try {
      return await this.checkoutBricksService.createPreference(data);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error creando preferencia de CheckoutBricks',
        code: 400
      };
    }
  }

  @MessagePattern('external.checkoutbricks.payment-status')
  async getCheckoutBricksPaymentStatus(@Payload() paymentId: string) {
    try {
      return await this.checkoutBricksService.getPaymentStatus(paymentId);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error obteniendo estado del pago CheckoutBricks',
        code: 400
      };
    }
  }

  @MessagePattern('external.checkoutbricks.webhook')
  async processCheckoutBricksWebhook(@Payload() notification: CheckoutBricksWebhookNotification) {
    try {
      return await this.checkoutBricksService.processWebhook(notification);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error procesando webhook de CheckoutBricks',
        code: 400
      };
    }
  }

  @MessagePattern('external.checkoutbricks.public-key')
  async getCheckoutBricksPublicKey() {
    try {
      return { public_key: this.checkoutBricksService.getPublicKey() };
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error obteniendo public key de CheckoutBricks',
        code: 400
      };
    }
  }

  @MessagePattern('external.checkoutbricks.payment-methods')
  async getCheckoutBricksPaymentMethods() {
    try {
      return await this.checkoutBricksService.getPaymentMethods();
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error obteniendo métodos de pago de CheckoutBricks',
        code: 400
      };
    }
  }
} 