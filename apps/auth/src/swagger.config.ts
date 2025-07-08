import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Auth Microservice')
  .setDescription('Microservicio de autenticación para el sistema Liquidar')
  .setVersion('1.0')
  .addTag('auth-microservice', 'Endpoints internos del microservicio de autenticación')
  .build(); 