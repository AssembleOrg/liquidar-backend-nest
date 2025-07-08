import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './swagger.config';
import * as fs from 'fs';
import * as path from 'path';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  
  // Guardar la documentación como JSON
  const outputPath = path.join(__dirname, 'swagger-spec.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  
  console.log(`📚 Swagger documentation generated at: ${outputPath}`);
  
  await app.close();
}

generateSwagger().catch(console.error); 