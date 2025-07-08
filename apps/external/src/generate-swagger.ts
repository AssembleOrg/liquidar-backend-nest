import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './swagger.config';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  
  // Guardar el documento JSON
  const fs = require('fs');
  const path = require('path');
  
  const outputPath = path.join(__dirname, '..', 'swagger-spec.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  
  console.log(`Swagger specification generated at: ${outputPath}`);
  
  await app.close();
}

generateSwagger(); 