import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.GENERAL_SERVICE_HOST || 'localhost',
      port: process.env.GENERAL_SERVICE_PORT || 3003,
    },
  });

  const configService = app.get(ConfigService);
  
  await app.listen();
  
  console.log(`General Service microservice is listening on port ${configService.get('GENERAL_SERVICE_PORT') || 3003}`);
}

bootstrap(); 