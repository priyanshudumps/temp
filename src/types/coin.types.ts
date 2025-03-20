export interface ICoin {
    coin_id: string;
    coin_type_legacy?: string | null;
    coin_address_fungible?: string | null;
    coin_name?: string | null;
    coin_symbol?: string | null;
    coin_defyapp_symbol?: string | null;
    coin_decimals: number;
    coin_description?: string | null;
    coin_logo_url?: string | null;
    coingecko_id?: string | null;
    coinmarketcap_id?: string | null;
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface ICoinLinks {
    coin_id: string;
    twitter?: string | null;
    telegram?: string | null;
    discord?: string | null;
    github?: string | null;
    website?: string | null;
    whitepaper?: string | null;
    medium?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
    reddit?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    forum?: string | null;
    other_links?: string[] | null;
    tags?: string[] | null;
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface ICoinScore {
    coin_id: string;
    score?: number | null;
    is_banned_panora?: boolean | null;
    is_permissioned_hippo?: boolean | null;
    coin_market_cap_rank?: number | null;
    geckoterminal_score?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface ICoinDexMetrics {
    coin_id: string;
    pair_id: string;
    dex?: string | null;
    base_token?: string | null;
    quote_token?: string | null;
    pair_created_at?: Date | null;
    transactions_m5_buys?: number | null;
    transactions_m5_sells?: number | null;
    transactions_h1_buys?: number | null;
    transactions_h1_sells?: number | null;
    transactions_h6_buys?: number | null;
    transactions_h6_sells?: number | null;
    transactions_h24_buys?: number | null;
    transactions_h24_sells?: number | null;
    volume_usd_24h?: number | null;
    volume_usd_6h?: number | null;
    volume_usd_1h?: number | null;
    volume_usd_5m?: number | null;
    price_change_usd_24h?: number | null;
    price_change_usd_6h?: number | null;
    price_change_usd_1h?: number | null;
    price_change_usd_5m?: number | null;
    liquidity_usd?: number | null;
    liquidity_base?: number | null;
    liquidity_quote?: number | null;
    fdv_usd?: number | null;
    created_at?: Date;
    updated_at?: Date;
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
  
  export interface ICurrencyPrice {
    currency_id: string;
    country: string;
    base_currency: string;
    price: number;
    created_at?: Date;
    updated_at?: Date;
  }
  
  // Cache related types
  export interface ICoinCache {
    [key: string]: ICoin;
  }
  
  export interface ICoinLinksCache {
    [key: string]: ICoinLinks;
  }
  
  export interface ICoinScoreCache {
    [key: string]: ICoinScore;
  }
  
  export interface ICoinDexMetricsCache {
    [key: string]: ICoinDexMetrics[];
  }
  
  export interface ICoinMetricsCache {
    [key: string]: ICoinMetrics;
  }
  
  // Additional type for transactions
  export interface ITransactions {
    m5?: {
      buys: number;
      sells: number;
    };
    h1?: {
      buys: number;
      sells: number;
    };
    h6?: {
      buys: number;
      sells: number;
    };
    h24?: {
      buys: number;
      sells: number;
    };
  }
  
  // Types for volume and price change
  export interface IVolumeData {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  }
  
  export interface IPriceChangeData {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  }
  
  export interface ILiquidityData {
    usd?: number;
    base?: number;
    quote?: number;
  }