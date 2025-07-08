import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('External Service API')
  .setDescription('Microservicio para integraciones externas (AFIP, Dólar, Vault)')
  .setVersion('1.0')
  .addTag('external-microservice')
  .build(); 