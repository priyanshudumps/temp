import logger from "../../config/logger";

const BASE_URL = "https://api.geckoterminal.com/api/v2";
const HEADERS = {
  Accept: "application/json;version=20230302",
};

// Token pool details response interfaces
export interface TokenPoolsResponse {
  data: PoolData[];
  meta?: Record<string, any>;
}

export interface PoolData {
  id: string;
  type: string;
  attributes: PoolAttributes;
  relationships: {
    base_token: {
      data: {
        id: string;
        type: string;
      };
    };
    quote_token: {
      data: {
        id: string;
        type: string;
      };
    };
    dex: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface PoolAttributes {
  base_token_price_usd: string | number;
  base_token_price_native_currency: string | number;
  quote_token_price_usd: string | number;
  quote_token_price_native_currency: string | number;
  base_token_price_quote_token: string | number;
  quote_token_price_base_token: string | number | null;
  address: string;
  name: string;
  pool_created_at: string;
  token_price_usd: string | number;
  fdv_usd: string | number;
  market_cap_usd: string | number | null;
  price_change_percentage: {
    m5: string | number;
    m15: string | number;
    m30: string | number;
    h1: string | number;
    h6: string | number;
    h24: string | number;
  };
  transactions: {
    m5: { buys: number; sells: number; buyers: number; sellers: number };
    m15: { buys: number; sells: number; buyers: number; sellers: number };
    m30: { buys: number; sells: number; buyers: number; sellers: number };
    h1: { buys: number; sells: number; buyers: number; sellers: number };
    h6: { buys: number; sells: number; buyers: number; sellers: number };
    h24: { buys: number; sells: number; buyers: number; sellers: number };
  };
  volume_usd: {
    m5: string | number;
    m15: string | number;
    m30: string | number;
    h1: string | number;
    h6: string | number;
    h24: string | number;
  };
  reserve_in_usd: string | number;
}

// OHLC data response interfaces
export interface OHLCResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      ohlcv_list: [number, number, number, number, number, number][];
    };
  };
  meta: {
    base: {
      address: string;
      name: string;
      symbol: string;
      coingecko_coin_id: string | null;
    };
    quote: {
      address: string;
      name: string;
      symbol: string;
      coingecko_coin_id: string | null;
    };
  };
}

export interface OHLCDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = 'day' | 'hour' | 'minute';

export interface OHLCParams {
  timeframe: Timeframe;
  aggregate?: number;
  before_timestamp?: number;
  limit?: number;
  currency?: 'usd' | 'token';
  token?: 'base' | 'quote' | string;
}

/**
 * Get token pools for a given token address
 * @param tokenAddress The full token address on the Aptos network
 * @param includeTokens Whether to include base_token and quote_token data
 * @param page Page number for pagination
 * @param sort Sort option for pools
 * @returns List of pools for the token
 */
export const getTokenPools = async (
  tokenAddress: string,
  includeTokens = true,
  page = 1,
  sort = "h24_volume_usd_liquidity_desc"
): Promise<TokenPoolsResponse> => {
  try {
    // Encode the token address for URL
    const encodedAddress = encodeURIComponent(tokenAddress);
    const network = "aptos"; 
    
    const includeParam = includeTokens ? "base_token,quote_token,dex" : "";
    const url = `${BASE_URL}/networks/${network}/tokens/${encodedAddress}/pools?page=${page}&sort=${sort}${includeParam ? `&include=${includeParam}` : ''}`;
    
    logger.info(`Fetching token pools from: ${url}`);
    
    const response = await fetch(url, { headers: HEADERS });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch token pools: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`Error fetching token pools from GeckoTerminal: ${error}`);
    return { data: [] };
  }
};

/**
 * @param tokenAddress The token address to find pools for
 * @returns The best stablecoin pool or null if none found
 */
export const findBestStablecoinPool = async (tokenAddress: string): Promise<PoolData | null> => {
  try {
    const poolsResponse = await getTokenPools(tokenAddress);
    
    if (!poolsResponse.data || poolsResponse.data.length === 0) {
      logger.warn(`No pools found for token: ${tokenAddress}`);
      return null;
    }
    
    const stablecoinPools = poolsResponse.data.filter(pool => {
      const quoteTokenId = pool.relationships.quote_token.data.id.toLowerCase();
      return quoteTokenId.includes("usdc") || quoteTokenId.includes("usdt");
    });
    
    if (stablecoinPools.length === 0) {
      logger.warn(`No stablecoin pools found for token: ${tokenAddress}`);
      return null;
    }
    
    stablecoinPools.sort((a, b) => {
      const reserveA = typeof a.attributes.reserve_in_usd === 'string' 
        ? parseFloat(a.attributes.reserve_in_usd) 
        : a.attributes.reserve_in_usd as number;
      
      const reserveB = typeof b.attributes.reserve_in_usd === 'string'
        ? parseFloat(b.attributes.reserve_in_usd)
        : b.attributes.reserve_in_usd as number;
      
      return reserveB - reserveA;
    });
    
    return stablecoinPools[0];
  } catch (error) {
    logger.error(`Error finding best stablecoin pool: ${error}`);
    return null;
  }
};

/**
 * @param poolAddress The pool address
 * @param params OHLC parameters (timeframe, aggregate, etc.)
 * @returns OHLC data for the pool
 */
export const getPoolOHLCData = async (
  poolAddress: string,
  params: OHLCParams
): Promise<OHLCDataPoint[]> => {
  try {
    const network = "aptos"; 
    const encodedAddress = encodeURIComponent(poolAddress);
    
    let url = `${BASE_URL}/networks/${network}/pools/${encodedAddress}/ohlcv/${params.timeframe}`;
    
    const queryParams = new URLSearchParams();
    if (params.aggregate) queryParams.append('aggregate', params.aggregate.toString());
    if (params.before_timestamp) queryParams.append('before_timestamp', params.before_timestamp.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.currency) queryParams.append('currency', params.currency);
    if (params.token) queryParams.append('token', params.token);
    
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    logger.info(`Fetching OHLC data from: ${url}`);
    
    const response = await fetch(url, { headers: HEADERS });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OHLC data: ${response.status} ${response.statusText}`);
    }
    
    const ohlcResponse: OHLCResponse = await response.json();
    
    return ohlcResponse.data.attributes.ohlcv_list.map(item => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5]
    }));
  } catch (error) {
    logger.error(`Error fetching OHLC data from GeckoTerminal: ${error}`);
    return [];
  }
};

/**
 * @param tokenAddress The token address
 * @param params OHLC parameters
 * @returns OHLC data for the token
 */
export const getTokenOHLCData = async (
  tokenAddress: string,
  params: OHLCParams = { timeframe: 'day' }
): Promise<OHLCDataPoint[]> => {
  try {
    const bestPool = await findBestStablecoinPool(tokenAddress);
    
    if (!bestPool) {
      logger.warn(`No suitable pool found for token: ${tokenAddress}`);
      return [];
    }
    
    // Get OHLC data for the pool
    return await getPoolOHLCData(bestPool.attributes.address, params);
  } catch (error) {
    logger.error(`Error getting token OHLC data: ${error}`);
    return [];
  }
};

export default {
  getTokenPools,
  findBestStablecoinPool,
  getPoolOHLCData,
  getTokenOHLCData
};