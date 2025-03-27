export interface PostgresConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export interface NodeApiKeys {
  chainbase: string;
  quicknode: string;
  nodereal: string;
  blastapi: string;
  blasiapiTwo: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface AppConfig {
  env: string;
  port: number;
  pg: PostgresConfig;
  nodeApiKeys: NodeApiKeys;
  coingeckoApiKey: string;
  coinMarketCapApiKey: string;
  exchangeRateApiKey?: string;
  redis: RedisConfig;
}