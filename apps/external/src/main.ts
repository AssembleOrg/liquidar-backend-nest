import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.EXTERNAL_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.EXTERNAL_SERVICE_PORT ?? '3002'),
    },
  });

  await app.listen();
  console.log('External microservice is listening on port', process.env.EXTERNAL_SERVICE_PORT || 3002);
}

bootstrap(); 