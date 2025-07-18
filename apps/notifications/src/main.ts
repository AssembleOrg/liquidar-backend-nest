import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.NOTIFICATIONS_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.NOTIFICATIONS_SERVICE_PORT ?? '3004'),
    },
  });

  await app.listen();
  console.log('Notifications microservice is listening on port', process.env.NOTIFICATIONS_SERVICE_PORT || 3004);
}

bootstrap(); 