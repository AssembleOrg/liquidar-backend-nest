import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'staging').default('development'),
  AUTH_SERVICE_HOST: Joi.string().default('localhost'),
  AUTH_SERVICE_PORT: Joi.number().default(3001),
  EXTERNAL_SERVICE_HOST: Joi.string().default('localhost'),
  EXTERNAL_SERVICE_PORT: Joi.number().default(3002),
  GENERAL_SERVICE_HOST: Joi.string().default('localhost'),
  GENERAL_SERVICE_PORT: Joi.number().default(3003),
  NOTIFICATIONS_SERVICE_HOST: Joi.string().default('localhost'),
  NOTIFICATIONS_SERVICE_PORT: Joi.number().default(3004),
});