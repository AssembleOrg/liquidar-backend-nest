import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  AUTH_POSTGRES_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional().default('postgresql://postgres:postgres@localhost:5434/liquidar_auth')
    }),
  JWT_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('dev_jwt_secret_key')
  }),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  NODE_ENV: Joi.string().valid('development', 'production', 'staging').default('development'),
  AUTH_SERVICE_HOST: Joi.string().default('localhost'),
  AUTH_SERVICE_PORT: Joi.number().default(3001),
  NOTIFICATIONS_SERVICE_URL: Joi.string().uri().default('http://localhost:3004'),
  VERIFICATION_URL: Joi.string().uri().default('http://localhost:3000/api/verify'),
}); 