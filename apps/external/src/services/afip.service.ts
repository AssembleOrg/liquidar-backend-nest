import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VaultService } from './vault.service';
import { TemplateService, BillData } from './template.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// @ts-ignore
const Afip = require('@afipsdk/afip.js');

export interface AfipCredentials {
  cuit: string;
  cert: string;
  key: string;
}

export interface ComprobanteRequest {
  tipoComprobante: number; // 1: Factura A, 6: Factura B, 11: Factura C
  puntoVenta: number;
  concepto: number; // 1: Productos, 2: Servicios, 3: Productos y Servicios
  tipoDoc: number; // 80: CUIT, 96: DNI, etc.
  nroDoc: string;
  fechaServicioDesde: string;
  fechaServicioHasta: string;
  fechaVtoPago: string;
  importeTotal: number;
  importeNeto: number;
  importeIva: number;
  items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    importe: number;
    alicuota: number;
  }>;
}

@Injectable()
export class AfipService {
  private readonly logger = new Logger(AfipService.name);

  constructor(
    private configService: ConfigService,
    private vaultService: VaultService,
    private templateService: TemplateService,
  ) { }

  private async connectToAfip(userId: string): Promise<typeof Afip> {
    try {
      this.logger.log('Conectando a AFIP SDK...');

      const accessToken: string = this.configService.get('AFIP_SDK_TOKEN') ?? '';


      // Obtener credenciales desde Vault usando el userId
      const userCredentials = await this.vaultService.obtenerSecretoAfip(userId);

      const credentials: AfipCredentials = {
        cuit: userCredentials.cuit,
        cert: userCredentials.cert,
        key: userCredentials.key,
      };

      // Crear nueva instancia de AFIP con las credenciales
      const afip = new Afip({
        CUIT: credentials.cuit,
        cert: credentials.cert,
        key: credentials.key,
        production: true,
        access_token: accessToken,
      });

      this.logger.log(`AFIP SDK conectado exitosamente para CUIT: ${credentials.cuit}`);
      return afip;
    } catch (error) {
      this.logger.error('Error conectando a AFIP SDK:', error.message);
      throw new Error('No se pudo conectar al SDK de AFIP');
    }
  }

    async obtenerPadron(cuit: string, userId?: string): Promise<any> {
    try {
      const user_id = userId ?? 'f3ec6520-7c10-4568-a4cf-bf34fbe736cd';
      this.logger.log(`Obteniendo padrón para CUIT: ${cuit}, userId: ${user_id}`);
      const afip = await this.connectToAfip(user_id);
      
      this.logger.log('AFIP SDK conectado, consultando padrón...');
      const padron = await afip.RegisterInscriptionProof.getTaxpayerDetails(cuit);
      return padron;
    } catch (error) {
      this.logger.error('Error obteniendo padrón:', error.message);
      throw new Error('No se pudo obtener el padrón');
    }
  }

  async obtenerUltimoComprobante(tipoComprobante: number, puntoVenta: number, userId: string): Promise<number> {
    try {
      this.logger.log(`Obteniendo último comprobante tipo ${tipoComprobante} en punto de venta ${puntoVenta} para usuario ${userId}`);

      const afip = await this.connectToAfip(userId);
      const ultimoComprobante = await afip.ElectronicBilling.getLastVoucher(tipoComprobante, puntoVenta);

      this.logger.log(`Último comprobante: ${ultimoComprobante}`);
      return ultimoComprobante;
    } catch (error) {
      this.logger.error('Error obteniendo último comprobante:', error.message);
      throw new Error('No se pudo obtener el último comprobante');
    }
  }

  async crearComprobante(comprobanteData: ComprobanteRequest, userId: string, type: 'ticket' | 'factura'): Promise<any> {
    try {
      this.logger.log('Creando comprobante AFIP...');

      // Obtener próximo número de comprobante
      const ultimoComprobante = await this.obtenerUltimoComprobante(
        comprobanteData.tipoComprobante,
        comprobanteData.puntoVenta,
        userId
      );
      const numeroComprobante = ultimoComprobante + 1;

      // Conectar a AFIP y crear comprobante
      const afip = await this.connectToAfip(userId);

      // Preparar datos del comprobante con múltiples items
      const voucherData = {
        'CantReg': 1,
        'PtoVta': comprobanteData.puntoVenta,
        'CbteTipo': comprobanteData.tipoComprobante,
        'Concepto': comprobanteData.concepto,
        'DocTipo': comprobanteData.tipoDoc,
        'DocNro': comprobanteData.nroDoc,
        'CbteFch': this.formatDate(new Date()),
        'ImpTotal': comprobanteData.importeTotal,
        'ImpTotConc': 0,
        'ImpNeto': comprobanteData.importeNeto,
        'ImpOpEx': 0,
        'ImpIVA': comprobanteData.importeIva,
        'ImpTrib': 0,
        'FchServDesde': comprobanteData.fechaServicioDesde,
        'FchServHasta': comprobanteData.fechaServicioHasta,
        'FchVtoPago': comprobanteData.fechaVtoPago,
        'MonId': 'PES',
        'MonCotiz': 1,
        'CbtesAsoc': [],
        'Tributos': [],
        'Iva': this.calculateIvaByItems(comprobanteData.items),
        'Opcionales': [],
        'Compradores': [],
      };

      const comprobante = await afip.ElectronicBilling.createVoucher(voucherData, true);
      this.logger.verbose(JSON.stringify(comprobante));
      this.logger.log(`Comprobante creado exitosamente: ${comprobante.CAE} - ${comprobante.CAEFchVto}`);

      // --- Generar QR AFIP ---
      const qrJson = {
        ver: 1,
        fecha: this.templateService.formatDate(new Date()),
        cuit: comprobante.CUIT,
        ptoVta: comprobanteData.puntoVenta,
        tipoCmp: comprobanteData.tipoComprobante,
        nroCmp: numeroComprobante,
        importe: comprobanteData.importeTotal,
        moneda: 'PES',
        ctz: 1,
        tipoDocRec: comprobanteData.tipoDoc,
        nroDocRec: comprobanteData.nroDoc,
        tipoCodAut: 'E',
        codAut: comprobante.CAE
      };
      const qrText = 'https://www.afip.gob.ar/fe/qr/?p=' + Buffer.from(JSON.stringify(qrJson)).toString('base64');
      const qrDataUrl = await this.templateService.generateQrDataUrl(qrText);
      // ---

      // Generar PDF personalizado usando Handlebars
      const billData: BillData = this.prepareBillData(comprobanteData, comprobante, numeroComprobante);
      billData.qr = qrDataUrl;
      const html = this.templateService.generateBillHTML(billData, type);

      const pdf = await afip.ElectronicBilling.createPDF({
        html: html,
        file_name: `Factura_${comprobanteData.tipoComprobante}_${numeroComprobante}`,
        options: {
          width: 8,
          marginLeft: 0.4,
          marginRight: 0.4,
          marginTop: 0.4,
          marginBottom: 0.4,
        },
      });

      return {
        numeroComprobante,
        cae: comprobante.CAE,
        fechaVencimientoCAE: comprobante.CAEFchVto,
        puntoVenta: comprobanteData.puntoVenta,
        tipoComprobante: comprobanteData.tipoComprobante,
        pdf: pdf.file, // URL del PDF generado
        html: html, // HTML generado por Handlebars
      };
    } catch (error) {
      this.logger.error('Error creando comprobante AFIP:', error.message);
      throw new Error('No se pudo crear el comprobante');
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private calculateIvaByItems(items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    importe: number;
    alicuota: number;
  }>): Array<{ Id: number; BaseImp: number; Importe: number }> {
    // Agrupar items por alícuota de IVA
    const ivaGroups = new Map<number, { baseImp: number; importe: number }>();

    items.forEach(item => {
      const alicuota = item.alicuota;
      const baseImp = item.importe / (1 + alicuota / 100);
      const importeIva = item.importe - baseImp;

      if (ivaGroups.has(alicuota)) {
        const existing = ivaGroups.get(alicuota)!;
        existing.baseImp += baseImp;
        existing.importe += importeIva;
      } else {
        ivaGroups.set(alicuota, { baseImp, importe: importeIva });
      }
    });

    // Convertir a formato AFIP
    const ivaArray: Array<{ Id: number; BaseImp: number; Importe: number }> = [];

    ivaGroups.forEach((values, alicuota) => {
      const ivaId = this.getIvaId(alicuota);
      ivaArray.push({
        Id: ivaId,
        BaseImp: Math.round(values.baseImp * 100) / 100, // Redondear a 2 decimales
        Importe: Math.round(values.importe * 100) / 100,
      });
    });

    return ivaArray;
  }

  private getIvaId(alicuota: number): number {
    // Mapeo de alícuotas a IDs de AFIP
    const ivaMapping: { [key: number]: number } = {
      0: 3,    // 0% - Exento
      10.5: 4, // 10.5% - IVA 10.5%
      21: 5,   // 21% - IVA 21%
      27: 6,   // 27% - IVA 27%
    };

    return ivaMapping[alicuota] || 5; // Default a 21% si no se encuentra
  }

  private prepareBillData(
    comprobanteData: ComprobanteRequest,
    comprobante: any,
    numeroComprobante: number,
  ): BillData {
    const tipoComprobante = this.templateService.getComprobanteTipo(comprobanteData.tipoComprobante);
    const concepto = this.templateService.getConceptoDescripcion(comprobanteData.concepto);

    return {
      emisor: {
        razonSocial: 'Empresa del Usuario', // Esto debería venir de las credenciales
        direccion: 'Dirección del Usuario',
        cuit: comprobante.CUIT,
        condicionIva: 'RESPONSABLE INSCRIPTO',
        iibb: '12345678',
        inicioActividad: '01/01/2020',
      },
      receptor: {
        razonSocial: 'CONSUMIDOR FINAL',
        cuit: comprobanteData.tipoDoc === 80 ? comprobanteData.nroDoc : undefined,
      },
      comprobante: {
        tipo: tipoComprobante.tipo,
        letra: tipoComprobante.letra,
        codigo: comprobanteData.tipoComprobante,
        puntoVenta: String(comprobanteData.puntoVenta).padStart(5, '0'),
        numero: String(numeroComprobante).padStart(8, '0'),
        fecha: this.templateService.formatDate(new Date()),
        concepto: concepto,
      },
      items: comprobanteData.items.map(item => ({
        cantidad: item.cantidad,
        descripcion: item.descripcion,
        alicuota: item.alicuota,
        importe: this.templateService.formatCurrency(item.importe),
      })),
      totales: {
        subtotal: this.templateService.formatCurrency(comprobanteData.importeNeto),
        iva: this.templateService.formatCurrency(comprobanteData.importeIva),
        total: this.templateService.formatCurrency(comprobanteData.importeTotal),
      },
      cae: {
        numero: comprobante.CAE,
        vencimiento: this.templateService.formatDate(new Date(comprobante.CAEFchVto)),
      },
    };
  }
} 