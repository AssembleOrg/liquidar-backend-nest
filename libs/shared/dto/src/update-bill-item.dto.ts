import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, Length, Matches } from 'class-validator';

export class UpdateBillItemDto {
  @ApiProperty({
    description: 'CUIT del contribuyente',
    example: '20-12345678-9',
    minLength: 11,
    maxLength: 20,
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(11, 20)
  @Matches(/^\d{2}-\d{8}-\d$/, {
    message: 'CUIT debe tener el formato XX-XXXXXXXX-X'
  })
  cuit?: string;

  @ApiProperty({
    description: 'Contraseña de AFIP (será hasheada)',
    example: 'password123',
    required: false
  })
  @IsString()
  @IsOptional()
  afipPassword?: string;

  @ApiProperty({
    description: 'Nombre del contribuyente',
    example: 'Juan Pérez',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Indica si es una persona real',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  realPerson?: boolean;

  @ApiProperty({
    description: 'Dirección del contribuyente',
    example: 'Av. Corrientes 1234, CABA',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Teléfono del contribuyente',
    example: '+54 11 1234-5678',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsString()
  @IsOptional()
  userId?: string;
} 