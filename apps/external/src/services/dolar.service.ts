import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface DolarResponse {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  moneda: string;
  fechaActualizacion: string;
}

@Injectable()
export class DolarService {
  private readonly logger = new Logger(DolarService.name);
  private readonly API_URL = 'https://dolarapi.com/v1/dolares/blue';

  async obtenerDolarActual(): Promise<DolarResponse> {
    try {
      this.logger.log('Consultando cotización del dólar blue...');
      
      const response = await axios.get<DolarResponse>(this.API_URL);
      const dolarData = response.data;

      this.logger.log(`Dólar blue actualizado: Compra $${dolarData.compra}, Venta $${dolarData.venta}`);
      
      return dolarData;
    } catch (error) {
      this.logger.error('Error consultando dólar blue:', error.message);
      throw new Error('No se pudo obtener la cotización del dólar');
    }
  }

  async obtenerDolarOficial(): Promise<DolarResponse> {
    try {
      this.logger.log('Consultando cotización del dólar oficial...');
      
      const response = await axios.get<DolarResponse>('https://dolarapi.com/v1/dolares/oficial');
      const dolarData = response.data;

      this.logger.log(`Dólar oficial actualizado: Compra $${dolarData.compra}, Venta $${dolarData.venta}`);
      
      return dolarData;
    } catch (error) {
      this.logger.error('Error consultando dólar oficial:', error.message);
      throw new Error('No se pudo obtener la cotización del dólar oficial');
    }
  }

  async obtenerTodosLosDolares(): Promise<DolarResponse[]> {
    try {
      this.logger.log('Consultando todas las cotizaciones del dólar...');
      
      const response = await axios.get<DolarResponse[]>('https://dolarapi.com/v1/dolares');
      const dolaresData = response.data;

      this.logger.log(`Se obtuvieron ${dolaresData.length} cotizaciones del dólar`);
      
      return dolaresData;
    } catch (error) {
      this.logger.error('Error consultando todas las cotizaciones del dólar:', error.message);
      throw new Error('No se pudieron obtener las cotizaciones del dólar');
    }
  }
} 