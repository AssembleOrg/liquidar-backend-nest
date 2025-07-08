import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExternalController } from './external.controller';
import { DolarService } from './services/dolar.service';
import { AfipService } from './services/afip.service';
import { VaultService } from './services/vault.service';
import { TemplateService } from './services/template.service';
import { MercadoPagoService } from './services/mercadopago.service';
import { CheckoutBricksService } from './services/checkoutbricks.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/external/.env',
      cache: false,
    }),
  ],
  controllers: [ExternalController],
  providers: [DolarService, AfipService, VaultService, TemplateService, MercadoPagoService, CheckoutBricksService],
})
export class AppModule {} 