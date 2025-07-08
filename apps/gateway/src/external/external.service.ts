import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExternalService {
  constructor(
    @Inject('EXTERNAL_SERVICE') private readonly externalClient: ClientProxy
  ) {}

  private handleMicroserviceError(error: any, operation: string) {
    console.error(`Error en ${operation}:`, error);
    return of({ status: 'error', message: `Error en ${operation}: ${error.message || 'Error desconocido'}` });
  }

  private handleMicroserviceResponse(response: any, operation: string) {
    if (response && response.status === 'error') {
      throw new Error(response.message || `Error en ${operation}`);
    }
    return response;
  }

  // ===== DOLAR METHODS =====
  async obtenerDolarBlue() {
    return firstValueFrom(
      this.externalClient.send('external.dolar.blue', {}).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Obtener dólar blue');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Obtener dólar blue'));
  }

  async obtenerDolarOficial() {
    return firstValueFrom(
      this.externalClient.send('external.dolar.oficial', {}).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Obtener dólar oficial');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Obtener dólar oficial'));
  }

  async obtenerTodosLosDolares() {
    return firstValueFrom(
      this.externalClient.send('external.dolar.todos', {}).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Obtener todos los dólares');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Obtener todos los dólares'));
  }

  // ===== AFIP METHODS =====
  async obtenerUltimoComprobante(tipoComprobante: number, puntoVenta: number, userId: string) {
    return firstValueFrom(
      this.externalClient.send('external.afip.ultimo-comprobante', { tipoComprobante, puntoVenta, userId }).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Obtener último comprobante');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Obtener último comprobante'));
  }

  async crearComprobante(comprobanteData: any, userId: string) {
    return firstValueFrom(
      this.externalClient.send('external.afip.crear-comprobante', { comprobanteData, userId }).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Crear comprobante');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Crear comprobante'));
  }

  // ===== MERCADOPAGO METHODS =====
  async createMercadoPagoPreference(data: any) {
    return firstValueFrom(
      this.externalClient.send('external.mercadopago.create-preference', data).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Crear preferencia MercadoPago');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Crear preferencia MercadoPago'));
  }

  async getMercadoPagoPaymentStatus(paymentId: string) {
    return firstValueFrom(
      this.externalClient.send('external.mercadopago.payment-status', paymentId).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Obtener estado del pago MercadoPago');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Obtener estado del pago MercadoPago'));
  }

  async processMercadoPagoWebhook(notification: any) {
    return firstValueFrom(
      this.externalClient.send('external.mercadopago.webhook', notification).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Procesar webhook MercadoPago');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Procesar webhook MercadoPago'));
  }

  // ===== CHECKOUTBRICKS METHODS =====
  async createCheckoutBricksPreference(data: any) {
    return firstValueFrom(
      this.externalClient.send('external.checkoutbricks.create-preference', data).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Crear preferencia CheckoutBricks');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Crear preferencia CheckoutBricks'));
  }

  async getCheckoutBricksPaymentStatus(paymentId: string) {
    return firstValueFrom(
      this.externalClient.send('external.checkoutbricks.payment-status', paymentId).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Obtener estado del pago CheckoutBricks');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Obtener estado del pago CheckoutBricks'));
  }

  async processCheckoutBricksWebhook(notification: any) {
    return firstValueFrom(
      this.externalClient.send('external.checkoutbricks.webhook', notification).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Procesar webhook CheckoutBricks');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Procesar webhook CheckoutBricks'));
  }

  async getCheckoutBricksPublicKey() {
    return firstValueFrom(
      this.externalClient.send('external.checkoutbricks.public-key', {}).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Obtener public key CheckoutBricks');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Obtener public key CheckoutBricks'));
  }

  async getCheckoutBricksPaymentMethods() {
    return firstValueFrom(
      this.externalClient.send('external.checkoutbricks.payment-methods', {}).pipe(
        catchError((error) => {
          return this.handleMicroserviceError(error, 'Obtener métodos de pago CheckoutBricks');
        })
      )
    ).then((response) => this.handleMicroserviceResponse(response, 'Obtener métodos de pago CheckoutBricks'));
  }
} 