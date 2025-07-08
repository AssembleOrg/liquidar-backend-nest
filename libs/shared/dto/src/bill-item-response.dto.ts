import { ApiProperty } from '@nestjs/swagger';

export class BillItemResponseDto {
  @ApiProperty({
    description: 'ID único del bill item',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'CUIT del contribuyente',
    example: '20-12345678-9'
  })
  cuit: string;

  @ApiProperty({
    description: 'Contraseña de AFIP (decodificada)',
    example: 'password123'
  })
  afipPassword: string;

  @ApiProperty({
    description: 'Nombre del contribuyente',
    example: 'Juan Pérez'
  })
  name: string;

  @ApiProperty({
    description: 'Indica si es una persona real',
    example: true
  })
  realPerson: boolean;

  @ApiProperty({
    description: 'Dirección del contribuyente',
    example: 'Av. Corrientes 1234, CABA',
    nullable: true
  })
  address: string | null;

  @ApiProperty({
    description: 'Teléfono del contribuyente',
    example: '+54 11 1234-5678',
    nullable: true
  })
  phone: string | null;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
} 