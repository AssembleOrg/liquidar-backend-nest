import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'staging').default('development'),
  NOTIFICATIONS_SERVICE_HOST: Joi.string().default('localhost'),
  NOTIFICATIONS_SERVICE_PORT: Joi.number().default(3004),
  BREVO_API_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('dummy_key_for_development')
  }),
  FROM_EMAIL: Joi.string().email().default('noreply@liquidar.com'),
  FROM_NAME: Joi.string().default('Liquidar'),
  VERIFICATION_URL: Joi.string().uri().default('http://localhost:3000/api/verify'),
}); 