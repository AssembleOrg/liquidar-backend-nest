import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExternalService } from './external.service';
import { CreatePreferenceDto, MercadoPagoWebhookDto, CreateCheckoutBricksPreferenceDto, CheckoutBricksWebhookDto } from '@shared/dto';

@ApiTags('external')
@Controller('external')
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  // ===== DOLAR ENDPOINTS =====
  @Get('dolar/blue')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener cotización del dólar blue' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cotización del dólar blue obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        compra: { type: 'number', example: 850 },
        venta: { type: 'number', example: 870 },
        casa: { type: 'string', example: 'Blue' },
        nombre: { type: 'string', example: 'Dólar Blue' },
        moneda: { type: 'string', example: 'USD' },
        fechaActualizacion: { type: 'string', example: '2025-01-07T21:40:24.652Z' },
      },
    },
  })
  async obtenerDolarBlue() {
    return this.externalService.obtenerDolarBlue();
  }

  @Get('dolar/oficial')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener cotización del dólar oficial' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cotización del dólar oficial obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        compra: { type: 'number', example: 800 },
        venta: { type: 'number', example: 820 },
        casa: { type: 'string', example: 'Oficial' },
        nombre: { type: 'string', example: 'Dólar Oficial' },
        moneda: { type: 'string', example: 'USD' },
        fechaActualizacion: { type: 'string', example: '2025-01-07T21:40:24.652Z' },
      },
    },
  })
  async obtenerDolarOficial() {
    return this.externalService.obtenerDolarOficial();
  }

  @Get('dolar/todos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las cotizaciones del dólar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Todas las cotizaciones del dólar obtenidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          compra: { type: 'number' },
          venta: { type: 'number' },
          casa: { type: 'string' },
          nombre: { type: 'string' },
          moneda: { type: 'string' },
          fechaActualizacion: { type: 'string' },
        },
      },
    },
  })
  async obtenerTodosLosDolares() {
    return this.externalService.obtenerTodosLosDolares();
  }

  // ===== AFIP ENDPOINTS =====
  @Get('afip/ultimo-comprobante')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener último comprobante AFIP' })
  @ApiQuery({ name: 'tipoComprobante', type: 'number', description: 'Tipo de comprobante (1: Factura A, 6: Factura B, 11: Factura C)' })
  @ApiQuery({ name: 'puntoVenta', type: 'number', description: 'Punto de venta' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Último comprobante obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        numeroComprobante: { type: 'number', example: 12345 },
      },
    },
  })
  async obtenerUltimoComprobante(
    @Query('tipoComprobante') tipoComprobante: number,
    @Query('puntoVenta') puntoVenta: number,
    @Query('userId') userId: string,
  ) {
    return this.externalService.obtenerUltimoComprobante(tipoComprobante, puntoVenta, userId);
  }

  @Post('afip/crear-comprobante')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear comprobante AFIP' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comprobanteData: {
          type: 'object',
          properties: {
            tipoComprobante: { type: 'number', description: '1: Factura A, 6: Factura B, 11: Factura C' },
            puntoVenta: { type: 'number' },
            concepto: { type: 'number', description: '1: Productos, 2: Servicios, 3: Productos y Servicios' },
            tipoDoc: { type: 'number', description: '80: CUIT, 96: DNI, etc.' },
            nroDoc: { type: 'string' },
            fechaServicioDesde: { type: 'string' },
            fechaServicioHasta: { type: 'string' },
            fechaVtoPago: { type: 'string' },
            importeTotal: { type: 'number' },
            importeNeto: { type: 'number' },
            importeIva: { type: 'number' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  descripcion: { type: 'string' },
                  cantidad: { type: 'number' },
                  precioUnitario: { type: 'number' },
                  importe: { type: 'number' },
                  alicuota: { type: 'number' },
                },
              },
            },
          },
        },
        userId: { type: 'string', description: 'ID del usuario' },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Comprobante creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        numeroComprobante: { type: 'number' },
        cae: { type: 'string' },
        fechaVencimientoCAE: { type: 'string' },
        puntoVenta: { type: 'number' },
        tipoComprobante: { type: 'number' },
      },
    },
  })
  async crearComprobante(@Body() data: { comprobanteData: any; userId: string }) {
    return this.externalService.crearComprobante(data.comprobanteData, data.userId);
  }

  // ===== MERCADOPAGO ENDPOINTS =====
  @Post('payments/mercadopago/create-preference')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear preferencia de pago MercadoPago' })
  @ApiBody({
    type: CreatePreferenceDto,
    description: 'Datos para crear preferencia de pago',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Preferencia creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1234567890abcdef' },
        init_point: { type: 'string', example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890abcdef' },
        sandbox_init_point: { type: 'string', example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890abcdef' },
        client_id: { type: 'string', example: '123456789' },
        collector_id: { type: 'number', example: 123456789 },
        operation_type: { type: 'string', example: 'regular_payment' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              quantity: { type: 'number' },
              unit_price: { type: 'number' },
              currency_id: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async createMercadoPagoPreference(@Body() createPreferenceDto: CreatePreferenceDto) {
    return this.externalService.createMercadoPagoPreference(createPreferenceDto);
  }

  @Get('payments/mercadopago/payment-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener estado de un pago MercadoPago' })
  @ApiQuery({ name: 'paymentId', type: 'string', description: 'ID del pago' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del pago obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 123456789 },
        status: { type: 'string', example: 'approved' },
        status_detail: { type: 'string', example: 'accredited' },
        transaction_amount: { type: 'number', example: 1000 },
        currency_id: { type: 'string', example: 'ARS' },
        description: { type: 'string', example: 'Pago de facturador premium' },
        date_created: { type: 'string', example: '2025-01-07T21:40:24.652Z' },
        payment_method_id: { type: 'string', example: 'credit_card' },
        payment_type_id: { type: 'string', example: 'credit_card' },
        external_reference: { type: 'string', example: 'liquidar_user_123_20250107' },
      },
    },
  })
  async getMercadoPagoPaymentStatus(@Query('paymentId') paymentId: string) {
    return this.externalService.getMercadoPagoPaymentStatus(paymentId);
  }

  @Post('payments/mercadopago/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook para notificaciones de MercadoPago' })
  @ApiBody({
    type: MercadoPagoWebhookDto,
    description: 'Notificación webhook de MercadoPago',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook procesado exitosamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'processed' },
        payment_id: { type: 'string', example: '123456789' },
        payment_status: { type: 'string', example: 'approved' },
      },
    },
  })
  async processMercadoPagoWebhook(@Body() webhookDto: MercadoPagoWebhookDto) {
    return this.externalService.processMercadoPagoWebhook(webhookDto);
  }

  // ===== CHECKOUTBRICKS ENDPOINTS =====
  @Post('payments/checkoutbricks/create-preference')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear preferencia de pago CheckoutBricks' })
  @ApiBody({
    type: CreateCheckoutBricksPreferenceDto,
    description: 'Datos para crear preferencia de pago CheckoutBricks',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Preferencia creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1234567890abcdef' },
        init_point: { type: 'string', example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890abcdef' },
        sandbox_init_point: { type: 'string', example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890abcdef' },
        client_id: { type: 'string', example: '123456789' },
        collector_id: { type: 'number', example: 123456789 },
        operation_type: { type: 'string', example: 'regular_payment' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              quantity: { type: 'number' },
              unit_price: { type: 'number' },
              currency_id: { type: 'string' },
            },
          },
        },
        payer: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            surname: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            identification: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                number: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  async createCheckoutBricksPreference(@Body() createPreferenceDto: CreateCheckoutBricksPreferenceDto) {
    return this.externalService.createCheckoutBricksPreference(createPreferenceDto);
  }

  @Get('payments/checkoutbricks/payment-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener estado de un pago CheckoutBricks' })
  @ApiQuery({ name: 'paymentId', type: 'string', description: 'ID del pago' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del pago obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 123456789 },
        status: { type: 'string', example: 'approved' },
        status_detail: { type: 'string', example: 'accredited' },
        transaction_amount: { type: 'number', example: 1000 },
        currency_id: { type: 'string', example: 'ARS' },
        description: { type: 'string', example: 'Pago de facturador premium' },
        date_created: { type: 'string', example: '2025-01-07T21:40:24.652Z' },
        payment_method_id: { type: 'string', example: 'credit_card' },
        payment_type_id: { type: 'string', example: 'credit_card' },
        external_reference: { type: 'string', example: 'liquidar_user_123_20250107' },
      },
    },
  })
  async getCheckoutBricksPaymentStatus(@Query('paymentId') paymentId: string) {
    return this.externalService.getCheckoutBricksPaymentStatus(paymentId);
  }

  @Post('payments/checkoutbricks/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook para notificaciones de CheckoutBricks' })
  @ApiBody({
    type: CheckoutBricksWebhookDto,
    description: 'Notificación webhook de CheckoutBricks',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook procesado exitosamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'processed' },
        payment_id: { type: 'string', example: '123456789' },
        payment_status: { type: 'string', example: 'approved' },
        payment_detail: { type: 'string', example: 'accredited' },
        transaction_amount: { type: 'number', example: 1000 },
        currency_id: { type: 'string', example: 'ARS' },
        external_reference: { type: 'string', example: 'liquidar_user_123_20250107' },
      },
    },
  })
  async processCheckoutBricksWebhook(@Body() webhookDto: CheckoutBricksWebhookDto) {
    return this.externalService.processCheckoutBricksWebhook(webhookDto);
  }

  @Get('payments/checkoutbricks/public-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener public key de CheckoutBricks' })
  @ApiResponse({ 
    status: 200, 
    description: 'Public key obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        public_key: { type: 'string', example: 'APP_USR-1234567890abcdef-123456-123456' },
      },
    },
  })
  async getCheckoutBricksPublicKey() {
    return this.externalService.getCheckoutBricksPublicKey();
  }

  @Get('payments/checkoutbricks/payment-methods')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener métodos de pago disponibles de CheckoutBricks' })
  @ApiResponse({ 
    status: 200, 
    description: 'Métodos de pago obtenidos exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          payment_type_id: { type: 'string' },
          status: { type: 'string' },
          secure_thumbnail: { type: 'string' },
          thumbnail: { type: 'string' },
          min_accreditation_days: { type: 'number' },
          max_accreditation_days: { type: 'number' },
        },
      },
    },
  })
  async getCheckoutBricksPaymentMethods() {
    return this.externalService.getCheckoutBricksPaymentMethods();
  }
} 