import { Module } from '@nestjs/common';
import { MicroserviceErrorHandler } from './microservice-error-handler';

@Module({
  providers: [MicroserviceErrorHandler],
  exports: [MicroserviceErrorHandler],
})
export class MicroserviceErrorsModule {} 