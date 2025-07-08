# Multi-stage build para optimizar el tamaño de la imagen
FROM node:18-alpine AS base

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración del workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nest-cli.json tsconfig*.json ./

# Crear directorios para las librerías compartidas
RUN mkdir -p libs/shared/templates

# Copiar configuración de las librerías compartidas (solo las que tienen package.json)
COPY libs/shared/templates/package.json ./libs/shared/templates/

# Crear directorios para las aplicaciones
RUN mkdir -p apps/gateway apps/auth apps/general apps/notifications apps/external

# Copiar configuración de las aplicaciones
COPY apps/gateway/package.json ./apps/gateway/
COPY apps/auth/package.json ./apps/auth/
COPY apps/general/package.json ./apps/general/
COPY apps/notifications/package.json ./apps/notifications/
COPY apps/external/package.json ./apps/external/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build stage
FROM base AS build

# Construir todas las aplicaciones usando nest build
RUN pnpm run build

# Verificar que los archivos se construyeron correctamente
RUN ls -la apps/gateway/dist/ || echo "Gateway dist no encontrado"
RUN ls -la apps/auth/dist/ || echo "Auth dist no encontrado"
RUN ls -la apps/general/dist/ || echo "General dist no encontrado"
RUN ls -la apps/notifications/dist/ || echo "Notifications dist no encontrado"
RUN ls -la apps/external/dist/ || echo "External dist no encontrado"

# Production stage
FROM node:18-alpine AS production

# Instalar pnpm
RUN npm install -g pnpm

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración del workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nest-cli.json tsconfig*.json ./

# Crear directorios para las librerías compartidas
RUN mkdir -p libs/shared/templates

# Copiar configuración de las librerías compartidas (solo las que tienen package.json)
COPY libs/shared/templates/package.json ./libs/shared/templates/

# Crear directorios para las aplicaciones
RUN mkdir -p apps/gateway apps/auth apps/general apps/notifications apps/external

# Copiar configuración de las aplicaciones
COPY apps/gateway/package.json ./apps/gateway/
COPY apps/auth/package.json ./apps/auth/
COPY apps/general/package.json ./apps/general/
COPY apps/notifications/package.json ./apps/notifications/
COPY apps/external/package.json ./apps/external/

# Instalar solo dependencias de producción
RUN pnpm install --frozen-lockfile --prod

# Copiar archivos construidos desde el stage de build
COPY --from=build --chown=nestjs:nodejs /app/apps/gateway/dist ./apps/gateway/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/auth/dist ./apps/auth/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/general/dist ./apps/general/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/notifications/dist ./apps/notifications/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/external/dist ./apps/external/dist
COPY --from=build --chown=nestjs:nodejs /app/libs ./libs

# Verificar que el archivo principal existe
RUN ls -la apps/gateway/dist/main.js || echo "main.js no encontrado en gateway"

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Variable de entorno para el puerto
ENV PORT=3000

# Comando por defecto (Railway usará el script start:gateway)
CMD ["node", "apps/gateway/dist/main.js"] 