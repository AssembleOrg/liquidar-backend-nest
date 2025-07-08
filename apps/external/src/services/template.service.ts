import { Injectable, Logger } from '@nestjs/common';
import * as Mustache from 'mustache';
import * as fs from 'fs';
import * as QRCode from 'qrcode';

export interface BillData {
  emisor: {
    razonSocial: string;
    direccion: string;
    cuit: string;
    condicionIva: string;
    iibb?: string;
    inicioActividad?: string;
  };
  receptor: {
    razonSocial: string;
    cuit?: string;
  };
  comprobante: {
    tipo: string;
    letra: string;
    codigo: number;
    puntoVenta: string;
    numero: string;
    fecha: string;
    concepto: string;
  };
  items: Array<{
    cantidad: number;
    descripcion: string;
    alicuota: number;
    importe: string;
  }>;
  totales: {
    subtotal: string;
    iva?: string;
    total: string;
  };
  cae: {
    numero: string;
    vencimiento: string;
  };
  qr?: string;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private readonly ticketTemplatePath = 'libs/shared/templates/src/ticket.mustache';
  private readonly facturaTemplatePath = 'libs/shared/templates/src/factura.mustache';

  generateBillHTML(data: BillData, type: 'ticket' | 'factura'): string {
    try {
      this.logger.log('Generando HTML de factura...');
      const templatePath = type === 'ticket' ? this.ticketTemplatePath : this.facturaTemplatePath;
      const template = fs.readFileSync(templatePath, 'utf8');
      const html = Mustache.render(template, data);
      this.logger.log('HTML de factura generado exitosamente');
      return html;
    } catch (error) {
      this.logger.error('Error generando HTML de factura:', error.message);
      throw new Error('No se pudo generar el HTML de la factura');
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  getComprobanteTipo(codigo: number): { tipo: string; letra: string } {
    const tipos = {
      1: { tipo: 'FACTURA', letra: 'A' },
      6: { tipo: 'FACTURA', letra: 'B' },
      11: { tipo: 'FACTURA', letra: 'C' },
      2: { tipo: 'NOTA DE DÉBITO', letra: 'A' },
      7: { tipo: 'NOTA DE DÉBITO', letra: 'B' },
      12: { tipo: 'NOTA DE DÉBITO', letra: 'C' },
      3: { tipo: 'NOTA DE CRÉDITO', letra: 'A' },
      8: { tipo: 'NOTA DE CRÉDITO', letra: 'B' },
      13: { tipo: 'NOTA DE CRÉDITO', letra: 'C' },
    };
    return tipos[codigo] || { tipo: 'COMPROBANTE', letra: '' };
  }

  getConceptoDescripcion(codigo: number): string {
    const conceptos = {
      1: 'Productos',
      2: 'Servicios',
      3: 'Productos y Servicios',
    };
    return conceptos[codigo] || 'Productos';
  }

  async generateQrDataUrl(qrText: string): Promise<string> {
    try {
      return await QRCode.toDataURL(qrText);
    } catch (error) {
      this.logger.error('Error generando QR:', error.message);
      throw new Error('No se pudo generar el QR');
    }
  }
} 