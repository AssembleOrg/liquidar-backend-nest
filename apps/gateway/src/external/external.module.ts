import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExternalController } from './external.controller';
import { ExternalService } from './external.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'EXTERNAL_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: process.env.EXTERNAL_SERVICE_HOST || 'localhost', // Default host if not set
            port: parseInt(process.env.EXTERNAL_SERVICE_PORT || '3002'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.register([
      {
        name: 'GENERAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GENERAL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.GENERAL_SERVICE_PORT || '3003'),
        },
      },
    ]),
  ],
  controllers: [ExternalController],
  providers: [ExternalService],
  exports: [ExternalService],
})
export class ExternalModule {} 