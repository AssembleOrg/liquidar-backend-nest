import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePreferenceDto {
  @ApiProperty({
    description: 'Monto del pago en centavos',
    example: 1000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Código de moneda',
    example: 'ARS',
    default: 'ARS',
  })
  @IsString()
  @IsOptional()
  currency?: string = 'ARS';

  @ApiProperty({
    description: 'Descripción del pago',
    example: 'Pago de facturador premium',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Número de cuotas',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  installments?: number = 1;

  @ApiProperty({
    description: 'Referencia externa del pago',
    example: 'liquidar_user_123_20250107',
    required: false,
  })
  @IsString()
  @IsOptional()
  external_reference?: string;
}

export class MercadoPagoWebhookDto {
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
    description: 'Datos de la notificación',
  })
  data: {
    id: string;
  };
}
