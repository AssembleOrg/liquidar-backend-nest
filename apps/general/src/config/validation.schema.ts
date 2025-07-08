import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  GENERAL_POSTGRES_URL: Joi.string()
  .uri({ scheme: ['postgres', 'postgresql'] })
  .when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('postgresql://postgres:CYSASFSAFSAFSAW@switchyard.proxy.rlwy.net:245125/railway')
  }),
  NODE_ENV: Joi.string().valid('development', 'production', 'staging').default('development'),
  GENERAL_SERVICE_HOST: Joi.string().default('localhost'),
  GENERAL_SERVICE_PORT: Joi.number().default(3003),
}); /*  */