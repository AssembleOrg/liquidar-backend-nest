import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno desde el archivo .env del microservicio
config({ path: join(__dirname, '../../.env') });

// Crear una instancia de ConfigService para usar en el datasource
const configService = new ConfigService();

export const GeneralDataSource = new DataSource({
  type: 'postgres',
  url: configService.get<string>('GENERAL_POSTGRES_URL') || process.env.GENERAL_POSTGRES_URL,
  ssl: (configService.get('NODE_ENV') || process.env.NODE_ENV) === 'production' ? {
    rejectUnauthorized: false,
  } : false,
  entities: [
    join(__dirname, '../entities/*.entity{.ts,.js}'),
  ],
  migrations: [
    join(__dirname, './migrations/*{.ts,.js}'),
  ],
  synchronize: false, // Usar migraciones en lugar de synchronize
  logging: (configService.get('NODE_ENV') || process.env.NODE_ENV) === 'development',
}); 