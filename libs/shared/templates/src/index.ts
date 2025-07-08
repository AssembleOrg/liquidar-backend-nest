// Este archivo exporta los templates de Mustache como strings
// para que puedan ser utilizados por los servicios

import * as fs from 'fs';
import * as path from 'path';

// Función helper para leer templates
function readTemplate(templateName: string): string {
  const templatePath = path.join(__dirname, `${templateName}.mustache`);
  return fs.readFileSync(templatePath, 'utf-8');
}

// Exportar templates
export const FACTURA_TEMPLATE = readTemplate('factura');
export const TICKET_TEMPLATE = readTemplate('ticket');

// Exportar todas las constantes
export const TEMPLATES = {
  FACTURA: FACTURA_TEMPLATE,
  TICKET: TICKET_TEMPLATE,
} as const;
