import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';
import { AppConfig } from '../types';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    PORT: Joi.number().default(3000),
    PG_HOST: Joi.string().required().description('PostgreSQL host'),
    PG_USER: Joi.string().required().description('PostgreSQL username'),
    PG_PASSWORD: Joi.string().required().description('PostgreSQL password'),
    PG_DATABASE: Joi.string()
      .required()
      .description('PostgreSQL database name'),
    PG_PORT: Joi.number().default(5432).description('PostgreSQL port'),
    CHAIN_BASE_KEY: Joi.string().required().description('Chain Base API Key'),
    QUICK_NODE_KEY: Joi.string().required().description('Quick Node API Key'),
    NODE_REAL_KEY: Joi.string().required().description('Node Real API Key'),
    BLAST_API_KEY: Joi.string().required().description('Blast API Key'),
    BLAST_API_KEY_TWO: Joi.string().required().description('Blast API Key Two'),
    COINGECKO_KEY: Joi.string().required().description('Coingecko API Key'),
    COIN_MARKET_CAP_API_KEY: Joi.string()
      .required()
      .description('Coin Market Cap API Key'),
    EXCHANGE_RATE_API_KEY: Joi.string(),
    REDIS_HOST: Joi.string().default('localhost').description('Redis host'),
    REDIS_PORT: Joi.number().default(6379).description('Redis port'),
    REDIS_PASSWORD: Joi.string().allow('').description('Redis password'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config: AppConfig = {
  env: envVars.NODE_ENV,
  port: Number(envVars.PORT),
  pg: {
    host: envVars.PG_HOST,
    user: envVars.PG_USER,
    password: envVars.PG_PASSWORD,
    database: envVars.PG_DATABASE,
    port: Number(envVars.PG_PORT),
  },
  nodeApiKeys: {
    chainbase: envVars.CHAIN_BASE_KEY,
    quicknode: envVars.QUICK_NODE_KEY,
    nodereal: envVars.NODE_REAL_KEY,
    blastapi: envVars.BLAST_API_KEY,
    blasiapiTwo: envVars.BLAST_API_KEY_TWO,
  },
  coingeckoApiKey: envVars.COINGECKO_KEY,
  coinMarketCapApiKey: envVars.COIN_MARKET_CAP_API_KEY,
  exchangeRateApiKey: envVars.EXCHANGE_RATE_API_KEY,
  redis: {
    host: envVars.REDIS_HOST,
    port: Number(envVars.REDIS_PORT),
    password: envVars.REDIS_PASSWORD,
  },
};

export default config;