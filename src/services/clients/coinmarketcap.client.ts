import config from "../../config/config";

const BASE_URL = "https://pro-api.coinmarketcap.com";
const HEADERS = {
  Accept: "application/json",
  "X-CMC_PRO_API_KEY": config.coinMarketCapApiKey,
};

interface MetadataParams {
  id: string;
  skip_invalid?: boolean;
  aux?: string;
}

interface QuoteParams {
  id: string;
  aux?: string;
  skip_invalid?: boolean;
}

interface MetadataResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
  data: Record<string, CoinMetadata>;
}

interface CoinMetadata {
  id: number;
  name: string;
  symbol: string;
  category: string;
  description: string;
  slug: string;
  logo: string;
  tags: string[];
  urls: {
    website: string[];
    technical_doc: string[];
    twitter: string[];
    reddit: string[];
    message_board: string[];
    chat: string[];
    explorer: string[];
    source_code: string[];
  };
  platform?: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  };
  date_added: string;
  notice: string;
  status: string;
}

interface QuoteResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
  data: Record<string, QuoteData>;
}

interface QuoteData {
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
  is_active: number;
  is_fiat: number;
  cmc_rank: number;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  tvl_ratio: number | null;
  last_updated: string;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      percent_change_60d: number;
      percent_change_90d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
      tvl: number | null;
      last_updated: string;
      market_cap_by_total_supply: number;
      volume_7d: number;
      volume_30d: number;
    };
  };
  infinite_supply: boolean;
}

const getMetadataByIds = async (ids: string[]): Promise<MetadataResponse> => {
  const params: MetadataParams = {
    id: ids.join(","),
    skip_invalid: true,
    aux: "urls,logo,description,tags,platform,date_added,notice,status",
  };
  
  const url = `${BASE_URL}/v2/cryptocurrency/info`;
  const searchParams = new URLSearchParams(params as unknown as Record<string, string>);
  const response = await fetch(`${url}?${searchParams}`, { headers: HEADERS });
  
  return await response.json();
};

const getLatestQuoteByIds = async (ids: string[]): Promise<QuoteResponse> => {
  const params: QuoteParams = {
    id: ids.join(","),
    aux: "num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply,market_cap_by_total_supply,volume_24h_reported,volume_7d,volume_7d_reported,volume_30d,volume_30d_reported,is_active,is_fiat",
    skip_invalid: true,
  };
  
  const url = `${BASE_URL}/v2/cryptocurrency/quotes/latest`;
  const searchParams = new URLSearchParams(params as unknown as Record<string, string>);
  const response = await fetch(`${url}?${searchParams}`, { headers: HEADERS });
  
  return await response.json();
};

export {
  getMetadataByIds,
  getLatestQuoteByIds,
  type MetadataResponse,
  type QuoteResponse,
  type CoinMetadata,
  type QuoteData
};