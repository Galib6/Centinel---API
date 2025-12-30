import { config } from 'dotenv';
import * as Joi from 'joi';
import * as path from 'path';

const envFilePath = path.join(
  process.cwd(),
  'environments',
  `${process.env.NODE_ENV || 'development'}.env`
);

config({
  path: envFilePath,
});

const envSchema = Joi.object({
  PORT: Joi.number().integer().default(8000),
  APP_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  API_PREFIX: Joi.string().default('api/v1'),
  API_BASE_URL: Joi.string().uri().default('http://localhost:4600'),
  TZ: Joi.string().default('UTC'),

  // Swagger configuration
  API_VERSION: Joi.string().default('1.0.0'),
  API_TITLE: Joi.string().default('Centinel Api'),
  API_DESCRIPTION: Joi.string().default('Nest js learning'),

  // Database configuration
  DB_TYPE: Joi.string().valid('postgres', 'mysql', 'sqlite').default('postgres'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_LOGGING: Joi.boolean().default(false),

  // Security configuration
  CORS_ALLOWED_ORIGINS: Joi.string().default('http://localhost,http://localhost:3000'),
  RATE_LIMIT_TTL: Joi.number().default(60000),
  RATE_LIMIT_MAX: Joi.number().default(100),

  //file storage
  S3_ENDPOINT: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_BUCKET: Joi.string().required(),
  S3_FOLDER_PREFIX: Joi.string(),
  S3_REGION: Joi.string().required(),

  // Logger configuration
  LOG_FOLDER: Joi.string().default('logs'),
  LOG_MAX_SIZE: Joi.string().default('100m'),
  LOG_MAX_FILES: Joi.number().integer().default(5),
  APP_VERSION: Joi.string().default('1.0.0'),

  // JWT configuration
  JWT_SECRET: Joi.string().required(),
  JWT_SALT_ROUNDS: Joi.number().default(10),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('30d'),
  JWT_TOKEN_AUDIENCE: Joi.string().default(''),
  JWT_TOKEN_ISSUER: Joi.string().default(''),

  // Auth configuration
  OTP_EXPIRES_IN: Joi.number().default(5000),

  //smtp
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.string().required(),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().integer().default(6379),
  REDIS_USERNAME: Joi.string().allow('').default(''),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_TLS: Joi.boolean().truthy('true').falsy('false').default(false),

  SEED_SUPER_ADMIN_EMAIL: Joi.string().required(),
  SEED_SUPER_ADMIN_PASSWORD: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_SECRET: Joi.string().required(),
  GOOGLE_REDIRECT_URL: Joi.string().required(),

  KAFKA_CLIENT_ID: Joi.string().required(),
  KAFKA_BROKER: Joi.string().required(),
  KAFKA_GROUP_ID: Joi.string().required(),
  KAFKA_ENABLED: Joi.string().required(),
  KAFKA_USERNAME: Joi.string().when('KAFKA_ENABLED', {
    is: 'true',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  KAFKA_PASSWORD: Joi.string().when('KAFKA_ENABLED', {
    is: 'true',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  KAFKA_SASL_MECHANISM: Joi.string().when('KAFKA_ENABLED', {
    is: 'true',
    then: Joi.valid('plain', 'scram-sha-256', 'scram-sha-512').default('plain'),
    otherwise: Joi.optional(),
  }),
}).unknown(true);

// Validate process.env
const { error, value: validatedEnv } = envSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  console.error('\n❌ ENV validation error:');
  if (error.details && Array.isArray(error.details)) {
    error.details.forEach((d) => {
      console.error(
        `  - ${d.message} (path: ${Array.isArray(d.path) ? d.path.join('.') : d.path})`
      );
    });
  } else {
    console.error(error.message);
  }
  console.error(
    `Loaded env file: ${path.join(process.cwd(), 'environments', `${process.env.NODE_ENV || 'development'}.env`)}`
  );
  process.exit(1);
}

export const envConfig = validatedEnv;
