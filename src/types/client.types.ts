export interface IPanoraCoin {
    name: string;
    symbol: string;
    tokenAddress: string;
    faAddress: string;
    decimals: number;
    logoUrl?: string;
    panoraSymbol?: string;
    coinGeckoId?: string;
    coinMarketCapId?: string;
    isBanned?: boolean;
    websiteUrl?: string;
    bridge?: string;
    category?: string;
  }
  
  export interface IHippoCoin {
    name: string;
    symbol: string;
    official_symbol?: string;
    coingecko_id?: string;
    decimals: number;
    logo_url?: string;
    project_url?: string;
    token_type: {
      type: string;
      account_address?: string;
      module_name?: string;
      struct_name?: string;
    };
    extensions: {
      data: any[];
    };
  }
  
  export interface IDexScreenerPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      address: string;
      name: string;
      symbol: string;
    };
    priceNative: number;
    priceUsd: number;
    txns: {
      m5: { buys: number; sells: number };
      h1: { buys: number; sells: number };
      h6: { buys: number; sells: number };
      h24: { buys: number; sells: number };
    };
    volume: {
      h24: number;
      h6: number;
      h1: number;
      m5: number;
    };
    priceChange: {
      m5: number;
      h1: number;
      h6: number;
      h24: number;
    };
    liquidity: {
      usd: number;
      base: number;
      quote: number;
    };
    fdv: number;
    pairCreatedAt?: string;
  }
  
  export interface IDexScreenerResponse {
    schemaVersion: string;
    pairs: IDexScreenerPair[];
  }
  
  export interface ICoinGeckoPrice {
    [coinId: string]: {
      usd: number;
      usd_market_cap: number;
      usd_24h_vol: number;
      usd_24h_change: number;
    };
  }
  
  export interface ICoinMarketCapQuote {
    price: number;
    volume_24h: number;
    volume_change_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    market_cap: number;
    market_cap_dominance: number;
    fully_diluted_market_cap: number;
    last_updated: string;
  }

export interface ICoinMetrics {
  coin_id: string;
  circulating_supply?: number | null;
  total_supply?: number | null;
  max_supply?: number | null;
  holders?: number | null;
  infinite_supply?: boolean | null;
  self_reported_market_cap?: number | null;
  self_reported_circulating_supply?: number | null;
  price_usd?: number | null;
  price_change_5m?: number | null;
  price_change_1hr?: number | null;
  price_change_6hr?: number | null;
  price_change_24h?: number | null;
  price_change_7d?: number | null;
  price_change_30d?: number | null;
  volume_24hr?: number | null;
  volume_7d?: number | null;
  volume_30d?: number | null;
  volume_change_24hr?: number | null;
  market_cap?: number | null;
  fully_diluted_market_cap?: number | null;
  merket_cap_by_total_supply?: number | null;
  tvl?: number | null;
  created_at?: Date;
  updated_at?: Date;
}
  
  export interface ICoinMarketCapData {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    num_market_pairs: number;
    date_added: string;
    tags: string[];
    max_supply: number | null;
    circulating_supply: number;
    total_supply: number;
    platform: any;
    cmc_rank: number;
    self_reported_circulating_supply: number | null;
    self_reported_market_cap: number | null;
    tvl_ratio: number | null;
    last_updated: string;
    quote: {
      USD: ICoinMarketCapQuote;
    };
  }
  
  export interface ICoinMarketCapResponse {
    status: {
      timestamp: string;
      error_code: number;
      error_message: string | null;
      elapsed: number;
      credit_count: number;
      notice: string | null;
    };
    data: {
      [id: string]: ICoinMarketCapData;
    };
  }
  
  export interface ICurrencyRateResponse {
    result: string;
    documentation: string;
    terms_of_use: string;
    time_last_update_unix: number;
    time_last_update_utc: string;
    time_next_update_unix: number;
    time_next_update_utc: string;
    base_code: string;
    conversion_rates: {
      [currencyCode: string]: number;
    };
  }
  
  export interface ISupportedCodesResponse {
    result: string;
    documentation: string;
    terms_of_use: string;
    supported_codes: Array<[string, string]>;
  }