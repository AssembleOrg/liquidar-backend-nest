import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    required: false,
  })
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: false,
  })
  @IsString()
  lastName?: string;
} 