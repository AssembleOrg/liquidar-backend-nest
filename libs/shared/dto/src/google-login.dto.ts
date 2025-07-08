import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Token de Google OAuth',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...',
  })
  @IsString()
  @IsNotEmpty()
  googleToken: string;
}
