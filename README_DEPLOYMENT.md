# Despliegue en Railway

Esta guía explica cómo desplegar tu aplicación de microservicios NestJS en Railway.

## Configuración para Railway

### 1. Variables de Entorno Requeridas

Configura las siguientes variables de entorno en Railway:

#### Base de Datos
```env
# PostgreSQL (Railway proporciona automáticamente)
DATABASE_URL=postgresql://username:password@host:port/database

# Para cada microservicio que use base de datos
AUTH_POSTGRES_URL=postgresql://username:password@host:port/database
GENERAL_POSTGRES_URL=postgresql://username:password@host:port/database
```

#### JWT
```env
JWT_SECRET=tu_jwt_secret_muy_seguro
```

#### Servicios Externos
```env
# AFIP
AFIP_SDK_TOKEN=tu_afip_sdk_token

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_access_token
MERCADOPAGO_SUCCESS_URL=https://tuapp.com/payment/success
MERCADOPAGO_FAILURE_URL=https://tuapp.com/payment/failure
MERCADOPAGO_PENDING_URL=https://tuapp.com/payment/pending
MERCADOPAGO_WEBHOOK_URL=https://tuapp.com/api/webhooks/mercadopago

# CheckoutBricks
CHECKOUTBRICKS_ACCESS_TOKEN=tu_checkoutbricks_access_token
CHECKOUTBRICKS_PUBLIC_KEY=tu_checkoutbricks_public_key
CHECKOUTBRICKS_SUCCESS_URL=https://tuapp.com/payment/success
CHECKOUTBRICKS_FAILURE_URL=https://tuapp.com/payment/failure
CHECKOUTBRICKS_PENDING_URL=https://tuapp.com/payment/pending
CHECKOUTBRICKS_WEBHOOK_URL=https://tuapp.com/api/webhooks/checkoutbricks

# Email (Brevo/Sendinblue)
BREVO_API_KEY=tu_brevo_api_key
```

#### Vault (opcional)
```env
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=tu_vault_token
```

### 2. Configuración de Microservicios

Railway detectará automáticamente el puerto desde la variable `PORT`. Los microservicios se comunicarán internamente usando TCP.

### 3. Despliegue

1. **Conectar repositorio a Railway**:
   - Ve a [Railway Dashboard](https://railway.app)
   - Crea un nuevo proyecto
   - Conecta tu repositorio de GitHub

2. **Configurar variables de entorno**:
   - En el dashboard de Railway, ve a la pestaña "Variables"
   - Agrega todas las variables de entorno listadas arriba

3. **Desplegar**:
   - Railway detectará automáticamente el Dockerfile
   - El build se ejecutará automáticamente
   - La aplicación se desplegará en el puerto asignado por Railway

## Desarrollo Local con Docker Compose

Para desarrollo local, usa el docker-compose.yml incluido:

```bash
# Construir y levantar todos los servicios
docker-compose up --build

# Solo levantar servicios específicos
docker-compose up gateway auth postgres

# Ver logs
docker-compose logs -f gateway

# Detener todos los servicios
docker-compose down
```

### Puertos por defecto:
- **Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **External Service**: http://localhost:3002
- **General Service**: http://localhost:3003
- **Notifications Service**: http://localhost:3004
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Estructura del Dockerfile

El Dockerfile utiliza un multi-stage build para optimizar el tamaño:

1. **Base Stage**: Instala pnpm y dependencias
2. **Build Stage**: Compila TypeScript
3. **Production Stage**: Imagen final optimizada

### Características:
- ✅ Multi-stage build para optimizar tamaño
- ✅ Usuario no-root para seguridad
- ✅ Caché de dependencias optimizado
- ✅ Soporte para pnpm workspace
- ✅ Build de todas las aplicaciones del monorepo

## Troubleshooting

### Error de conexión entre microservicios
- Verifica que las variables `*_SERVICE_HOST` y `*_SERVICE_PORT` estén configuradas
- En Railway, los servicios se comunican internamente usando los nombres de servicio

### Error de base de datos
- Verifica que `DATABASE_URL` esté configurada correctamente
- Asegúrate de que la base de datos esté disponible antes de que los servicios intenten conectarse

### Error de build
- Verifica que todos los archivos de configuración estén presentes
- Asegúrate de que pnpm-lock.yaml esté actualizado

### Variables de entorno faltantes
- Railway requiere que todas las variables de entorno estén configuradas
- Usa el dashboard de Railway para configurar las variables

## Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de rendimiento
- Health checks automáticos
- Rollbacks automáticos en caso de fallo

## Escalabilidad

Para escalar en Railway:
1. Ve a la pestaña "Settings" de tu servicio
2. Ajusta el número de instancias
3. Railway manejará automáticamente el balanceo de carga

## Seguridad

- ✅ Usuario no-root en contenedor
- ✅ Variables de entorno seguras
- ✅ Health checks configurados
- ✅ Restart policy configurado
- ✅ CORS configurado para producción

## Comandos Útiles

```bash
# Ver logs en Railway
railway logs

# Ejecutar comandos en Railway
railway run pnpm run build

# Ver variables de entorno
railway variables

# Conectar a la base de datos
railway connect
``` 