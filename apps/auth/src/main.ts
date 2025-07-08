import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.AUTH_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.AUTH_SERVICE_PORT ?? '3001'),
    },
  });

  await app.listen();
  console.log('Auth microservice is listening on port', process.env.AUTH_SERVICE_PORT || 3001);
}
bootstrap(); 