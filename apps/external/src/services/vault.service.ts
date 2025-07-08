import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as vault from 'node-vault';

export interface VaultSecret {
  [key: string]: any;
}

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private vaultClient: vault.client;
  private readonly pathAfip = 'liquidar/secrets/';

  constructor(private configService: ConfigService) {
    this.initializeVault();
  }

  private async initializeVault() {
    try {
      this.logger.log('Inicializando cliente Vault');
      const vaultUrl = this.configService.get<string>('VAULT_URL');
      const vaultToken = this.configService.get<string>('VAULT_TOKEN');
      this.logger.log('vaultUrl: ' + vaultUrl);
      this.logger.log('vaultToken: ' + vaultToken);

      if (!vaultUrl || !vaultToken) {
        this.logger.warn('Vault URL o Token no configurados');
        return;
      }

      this.vaultClient = vault({
        apiVersion: 'v1',
        endpoint: vaultUrl,
        token: vaultToken,
      });

      this.logger.log('Cliente Vault inicializado correctamente');
    } catch (error) {
      this.logger.error('Error inicializando cliente Vault:', error.message);
    }
  }

  async obtenerSecretoAfip(idUser: string): Promise<VaultSecret> {
    try {
      if (!this.vaultClient) {
        throw new Error('Cliente Vault no inicializado');
      }

      this.logger.log(`Obteniendo secreto desde Vault: ${this.pathAfip}${idUser}`);
      
      const response = await this.vaultClient.read(this.pathAfip + idUser);
      
      this.logger.log(`Secreto obtenido exitosamente desde: ${this.pathAfip}${idUser}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error obteniendo secreto desde ${this.pathAfip}${idUser}:`, error.message);
      throw new Error(`No se pudo obtener el secreto desde ${this.pathAfip}`);
    }
  }

  async guardarSecretoAfip(secret: VaultSecret, idUser: string): Promise<void> {

    this.logger.log('Guardando secreto en Vault: ' + this.pathAfip + idUser);
    try {
      if (!this.vaultClient) {
        throw new Error('Cliente Vault no inicializado');
      }

      this.logger.log(`Guardando secreto en Vault: ${this.pathAfip}${idUser}`);
      
      await this.vaultClient.write(this.pathAfip + idUser, secret);
      
      this.logger.log(`Secreto guardado exitosamente en: ${this.pathAfip}`);
    } catch (error) {
      this.logger.error(`Error guardando secreto en Path de Vault`, error.message);
      throw new Error(`No se pudo guardar el secreto en Path de Vault`);
    }
  }

  async eliminarSecretoAfip(idUser: string): Promise<void> {
    try {
      if (!this.vaultClient) {
        throw new Error('Cliente Vault no inicializado');
      }

      this.logger.log(`Eliminando secreto de Vault: ${this.pathAfip}${idUser}`);
      
      await this.vaultClient.delete(this.pathAfip + idUser);
      
      this.logger.log(`Secreto eliminado exitosamente de: ${this.pathAfip}`);
    } catch (error) {
      this.logger.error(`Error eliminando secreto de ${this.pathAfip}:`, error.message);
      throw new Error(`No se pudo eliminar el secreto de ${this.pathAfip}`);
    }
  }

  async listarSecretos(path: string): Promise<string[]> {
    try {
      if (!this.vaultClient) {
        throw new Error('Cliente Vault no inicializado');
      }

      this.logger.log(`Listando secretos en Vault: ${path}`);
      
      const response = await this.vaultClient.list(path);
      
      this.logger.log(`Secretos listados exitosamente en: ${path}`);
      return response.data.keys || [];
    } catch (error) {
      this.logger.error(`Error listando secretos en ${path}:`, error.message);
      throw new Error(`No se pudieron listar los secretos en ${path}`);
    }
  }

  /* async obtenerCredencialesAfip(): Promise<{ cuit: string; cert: string; key: string }> {
    try {
      const secret = await this.obtenerSecreto('secret/afip');
      return {
        cuit: secret.cuit,
        cert: secret.cert,
        key: secret.key,
      };
    } catch (error) {
      this.logger.error('Error obteniendo credenciales AFIP desde Vault:', error.message);
      throw new Error('No se pudieron obtener las credenciales AFIP');
    }
  } */
} 