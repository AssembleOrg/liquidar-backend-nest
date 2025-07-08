import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillItem } from './entities/bill-item.entity';
import { BillItemService } from './services/bill-item.service';
import { BillItemController } from './bill-item.controller';
import { configValidationSchema } from './config/validation.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath: 'apps/general/.env',
      cache: false,
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP, // o el que uses (TCP, REDIS, etc)
        options: {
          host: 'localhost', // o la IP/host de tu microservicio de auth
          port: 3001,        // el puerto donde escucha el auth-service
        },
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('GENERAL_POSTGRES_URL'),
        ssl: configService.get('NODE_ENV') === 'production' ? {
          rejectUnauthorized: false,
        } : false,
        entities: [BillItem],
        synchronize: false, // Usar migraciones en lugar de synchronize
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([BillItem]),
  ],
  controllers: [BillItemController],
  providers: [BillItemService],
})
export class AppModule {} 