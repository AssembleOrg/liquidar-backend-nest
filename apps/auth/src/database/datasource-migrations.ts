import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno
config({ path: join(__dirname, '../../.env') });

export const AuthDataSourceMigrations = new DataSource({
  type: 'postgres',
  url: process.env.AUTH_POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
  entities: [
    join(__dirname, '../entities/*.entity{.ts,.js}'),
  ],
  migrations: [
    join(__dirname, './migrations/*{.ts,.js}'),
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
}); 