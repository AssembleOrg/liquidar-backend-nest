import { IsNumber, IsString, IsOptional, Min, IsArray, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckoutBricksItemDto {
  @ApiProperty({
    description: 'ID del item',
    example: 'item_1',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Título del item',
    example: 'Facturador Premium',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descripción del item',
    example: 'Suscripción mensual al facturador premium',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Cantidad del item',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario en centavos',
    example: 1000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  unit_price: number;

  @ApiProperty({
    description: 'Código de moneda',
    example: 'ARS',
    default: 'ARS',
  })
  @IsString()
  @IsOptional()
  currency_id?: string = 'ARS';
}

export class CheckoutBricksPayerDto {
  @ApiProperty({
    description: 'Nombre del pagador',
    example: 'Juan',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Apellido del pagador',
    example: 'Pérez',
  })
  @IsString()
  surname: string;

  @ApiProperty({
    description: 'Email del pagador',
    example: 'juan.perez@email.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Teléfono del pagador',
    example: '+5491112345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Identificación del pagador',
    example: {
      type: 'DNI',
      number: '12345678',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  identification?: {
    type: string;
    number: string;
  };
}

export class CreateCheckoutBricksPreferenceDto {
  @ApiProperty({
    description: 'Items del pago',
    type: [CheckoutBricksItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutBricksItemDto)
  items: CheckoutBricksItemDto[];

  @ApiProperty({
    description: 'Información del pagador',
    type: CheckoutBricksPayerDto,
  })
  @ValidateNested()
  @Type(() => CheckoutBricksPayerDto)
  payer: CheckoutBricksPayerDto;

  @ApiProperty({
    description: 'Referencia externa del pago',
    example: 'liquidar_user_123_20250107',
    required: false,
  })
  @IsString()
  @IsOptional()
  external_reference?: string;

  @ApiProperty({
    description: 'Fecha de expiración',
    example: '2025-01-08T21:40:24.652Z',
    required: false,
  })
  @IsString()
  @IsOptional()
  expiration_date?: string;

  @ApiProperty({
    description: 'URL de retorno exitoso',
    example: 'https://tuapp.com/payment/success',
    required: false,
  })
  @IsString()
  @IsOptional()
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };

  @ApiProperty({
    description: 'URL de notificación webhook',
    example: 'https://tuapp.com/api/webhooks/checkoutbricks',
    required: false,
  })
  @IsString()
  @IsOptional()
  notification_url?: string;

  @ApiProperty({
    description: 'Configuración de métodos de pago',
    required: false,
  })
  @IsObject()
  @IsOptional()
  payment_methods?: {
    installments?: number;
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
  };

  @ApiProperty({
    description: 'Configuración adicional',
    required: false,
  })
  @IsObject()
  @IsOptional()
  additional_info?: {
    items?: any[];
    payer?: any;
    shipments?: any;
  };
}

export class CheckoutBricksPreferenceResponseDto {
  @ApiProperty({
    description: 'ID de la preferencia',
    example: '1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'URL de inicialización',
    example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890abcdef',
  })
  init_point: string;

  @ApiProperty({
    description: 'URL de inicialización en sandbox',
    example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890abcdef',
  })
  sandbox_init_point: string;

  @ApiProperty({
    description: 'ID del cliente',
    example: '123456789',
  })
  client_id: string;

  @ApiProperty({
    description: 'ID del colector',
    example: '123456789',
  })
  collector_id: number;

  @ApiProperty({
    description: 'Tipo de operación',
    example: 'regular_payment',
  })
  operation_type: string;

  @ApiProperty({
    description: 'Items de la preferencia',
    type: [CheckoutBricksItemDto],
  })
  items: CheckoutBricksItemDto[];

  @ApiProperty({
    description: 'Información del pagador',
    type: CheckoutBricksPayerDto,
  })
  payer: CheckoutBricksPayerDto;

  @ApiProperty({
    description: 'URLs de retorno',
  })
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };

  @ApiProperty({
    description: 'URL de notificación',
  })
  notification_url: string;

  @ApiProperty({
    description: 'Referencia externa',
  })
  external_reference: string;

  @ApiProperty({
    description: 'Fecha de expiración',
  })
  expires: boolean;

  @ApiProperty({
    description: 'Fecha de expiración desde',
  })
  expiration_date_from: string;

  @ApiProperty({
    description: 'Fecha de expiración hasta',
  })
  expiration_date_to: string;
}

export class CheckoutBricksPaymentDto {
  @ApiProperty({
    description: 'ID del pago',
    example: 123456789,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Estado del pago',
    example: 'approved',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Estado detallado del pago',
    example: 'approved',
  })
  @IsString()
  status_detail: string;

  @ApiProperty({
    description: 'Monto del pago',
    example: 1000,
  })
  @IsNumber()
  transaction_amount: number;

  @ApiProperty({
    description: 'Moneda del pago',
    example: 'ARS',
  })
  @IsString()
  currency_id: string;

  @ApiProperty({
    description: 'Descripción del pago',
    example: 'Pago de facturador premium',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-07T21:40:24.652Z',
  })
  @IsString()
  date_created: string;

  @ApiProperty({
    description: 'Fecha de aprobación',
    example: '2025-01-07T21:40:24.652Z',
    required: false,
  })
  @IsString()
  @IsOptional()
  date_approved?: string;

  @ApiProperty({
    description: 'Método de pago',
    example: 'credit_card',
  })
  @IsString()
  payment_method_id: string;

  @ApiProperty({
    description: 'Tipo de pago',
    example: 'credit_card',
  })
  @IsString()
  payment_type_id: string;

  @ApiProperty({
    description: 'Referencia externa',
    example: 'liquidar_user_123_20250107',
  })
  @IsString()
  external_reference: string;

  @ApiProperty({
    description: 'Información del pagador',
  })
  @IsObject()
  payer: CheckoutBricksPayerDto;

  @ApiProperty({
    description: 'Información del método de pago',
  })
  @IsObject()
  payment_method: {
    id: string;
    type: string;
    issuer_id?: string;
  };

  @ApiProperty({
    description: 'Información de cuotas',
  })
  @IsObject()
  installments: {
    quantity: number;
    amount: number;
    rate: number;
    currency_id: string;
  };
}

export class CheckoutBricksWebhookDto {
  @ApiProperty({
    description: 'ID de la notificación',
    example: 12345,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Indica si es modo live o sandbox',
    example: false,
  })
  live_mode: boolean;

  @ApiProperty({
    description: 'Tipo de notificación',
    example: 'payment',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-07T21:40:24.652Z',
  })
  @IsString()
  date_created: string;

  @ApiProperty({
    description: 'ID de la aplicación',
    example: 123456789,
  })
  @IsNumber()
  application_id: number;

  @ApiProperty({
    description: 'ID del usuario',
    example: 123456789,
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description: 'Versión de la API',
    example: '1.0',
  })
  @IsString()
  api_version: string;

  @ApiProperty({
    description: 'Acción realizada',
    example: 'payment.created',
  })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Datos de la notificación',
  })
  @IsObject()
  data: {
    id: string;
  };
} 