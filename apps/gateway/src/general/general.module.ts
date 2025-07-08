import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeneralController } from './general.controller';
import { GeneralService } from './general.service';
import { MicroserviceErrorsModule } from '@shared/common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'GENERAL_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('GENERAL_SERVICE_HOST', 'localhost'),
            port: configService.get('GENERAL_SERVICE_PORT', 3003),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    MicroserviceErrorsModule,
  ],
  controllers: [GeneralController],
  providers: [GeneralService],
  exports: [GeneralService],
})
export class GeneralModule {} 