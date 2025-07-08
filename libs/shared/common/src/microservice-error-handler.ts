import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

export interface MicroserviceErrorResponse {
  status: 'error';
  message: string;
  code: number;
}

@Injectable()
export class MicroserviceErrorHandler {
  private readonly logger = new Logger(MicroserviceErrorHandler.name);

  /**
   * Maneja la respuesta de un microservicio y propaga errores como HttpException
   */
  handleMicroserviceResponse(response: any, operation: string): any {
    if (response && typeof response === 'object' && response.status === 'error') {
      const errorMessage = response.message || `${operation} failed`;
      const errorCode = response.code || 400;

      throw new HttpException(errorMessage, errorCode);
    }

    return response;
  }

  /**
   * Maneja errores de microservicios y los convierte en HttpException apropiados
   */
  handleMicroserviceError(error: any, operation: string): never {
    this.logger.error(`${operation} error:`, error);

    // Si es un error de negocio controlado, lo convertimos en HttpException
    if (error && typeof error === 'object' && error.status === 'error') {
      throw new HttpException(error.message, error.code || 400);
    }

    // Si ya es un HttpException, lo relanzamos
    if (error instanceof HttpException) {
      throw error;
    }

    // Para otros errores, lanzamos un error genérico
    const errorMessage = error.message || `${operation} failed`;
    throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * Ejecuta una operación de microservicio con manejo de errores completo
   */
  async executeMicroserviceOperation<T>(
    client: ClientProxy,
    pattern: string,
    data: any,
    operation: string
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        client.send(pattern, data)
      );
      return this.handleMicroserviceResponse(response, operation);
    } catch (error) {
      this.logger.error(`${operation} error:`, error);
      
      // Si el error ya es un HttpException, lo relanzamos
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Si es un error de microservicio con formato de respuesta de error
      if (error && typeof error === 'object' && error.status === 'error') {
        throw new HttpException(error.message, error.code || 400);
      }
      
      // Para otros errores, lanzamos un error genérico
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 