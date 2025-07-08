import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { ExternalModule } from './external/external.module';
import { GeneralModule } from './general/general.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    AuthModule,
    ExternalModule,
    GeneralModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
