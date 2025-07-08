import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno
config({ path: join(__dirname, '../../.env') });
console.log(process.env.AUTH_POSTGRES_URL);

export const AuthDataSource = new DataSource({
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
  synchronize: false, // Usar migraciones en lugar de synchronize
  logging: process.env.NODE_ENV === 'development',
}); 