declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: 'production' | 'development' | 'test';
        PORT: string;
        PG_HOST: string;
        PG_USER: string;
        PG_PASSWORD: string;
        PG_DATABASE: string;
        PG_PORT: string;
        CHAIN_BASE_KEY: string;
        QUICK_NODE_KEY: string;
        NODE_REAL_KEY: string;
        BLAST_API_KEY: string;
        BLAST_API_KEY_TWO: string;
        COINGECKO_KEY: string;
        COIN_MARKET_CAP_API_KEY: string;
        EXCHANGE_RATE_API_KEY?: string;
      }
    }
  }
  
  export {};