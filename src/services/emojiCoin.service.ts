import logger from '../config/logger';
import redisCache from '../utils/redisCache';
import CoinClients from './clients';
import { IEmojiCoinTicker } from './clients/emojiCoinTickers.client';

// Cache expiry time: 2 minutes (120 seconds) for frequently changing data
const CACHE_TTL_TRENDING = 120;
const CACHE_TTL_TRADES = 300; // 5 minutes for historical trades
const CACHE_PREFIX_TRENDING = 'emoji:trending';
const CACHE_PREFIX_TRADES = 'emoji:trades';
const CACHE_PREFIX_TICKERS = 'emoji:tickers';
const CACHE_TTL_TICKERS = 300; // 5 minutes for tickers data

/**
 * Interface for trending emoji coin data
 */
interface EmojiCoinTrending {
  transaction_version: number;
  sender: string;
  transaction_timestamp: string;
  market_id: number;
  symbol_bytes: string;
  symbol_emojis: string[];
  market_address: string;
  theoretical_curve_price: number;
  market_nonce: number;
  in_bonding_curve: boolean;
  clamm_virtual_reserves: {
    base: number;
    quote: number;
  };
  cpamm_real_reserves: {
    base: number;
    quote: number;
  };
  cumulative_stats: {
    base_volume: number;
    quote_volume: number;
    integrator_fees: number;
    pool_fees_base: number;
    pool_fees_quote: number;
    n_swaps: number;
    n_chat_messages: number;
  };
  instantaneous_stats: {
    circulating_supply: number;
    total_quote_locked: number;
    total_value_locked: number;
    fully_diluted_value: number;
    market_cap_apt: number;
    market_cap_usd: number;
  };
  daily_tvl_lp_growth: number;
  daily_volume_quote: number;
  daily_volume_base: number;
  quote_price: number;
  quote_price_24h_ago: number;
  quote_price_delta_24h: number;
  usd_price: number;
}

/**
 * Interface for emoji coin historical trade data
 */
interface EmojiCoinTrade {
  trade_id: string;
  price: string;
  base_volume: string;
  target_volume: string;
  trade_timestamp: string;
  type: string;
}

/**
 * Interface for emoji coin trending response
 */
interface EmojiCoinTrendingResponse {
  trending_coins: EmojiCoinTrending[];
  cached?: boolean;
  cache_time?: string;
  error?: string;
}

/**
 * Interface for emoji coin trades response
 */
interface EmojiCoinTradesResponse {
  market_address: string;
  trades: EmojiCoinTrade[];
  cached?: boolean;
  cache_time?: string;
  error?: string;
}

/**
 * Interface for emoji coin tickers response
 */
interface EmojiCoinTickersResponse {
  tickers: IEmojiCoinTicker[];
  cached?: boolean;
  cache_time?: string;
  error?: string;
}

/**
 * Get all tickers with pagination support
 * @param batchLimit Number of tickers to fetch in each batch
 * @param maxTickers Maximum total tickers to fetch
 * @param skipCache Whether to skip checking the cache
 * @returns Object containing all fetched tickers
 */
export const getAllEmojiCoinTickers = async (
  batchLimit: number = 500,
  maxTickers: number = 5000,
  skipCache: boolean = false
): Promise<EmojiCoinTickersResponse> => {
  try {
    const cacheKey = redisCache.createCacheKey(CACHE_PREFIX_TICKERS, `max-${maxTickers}`);
    
    if (!skipCache) {
      const cachedData = await redisCache.getCache<EmojiCoinTickersResponse>(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          cached: true,
          cache_time: new Date().toISOString()
        };
      }
    }
    
    logger.info(`Fetching all EmojiCoin tickers with pagination (max: ${maxTickers})`);
    
    const allTickers: IEmojiCoinTicker[] = [];
    let hasMoreData = true;
    let skip = 0;
    
    // Fetch data in batches with pagination
    while (hasMoreData && allTickers.length < maxTickers) {
      try {
        const batchTickers = await CoinClients.emojiCoinTickersClient(batchLimit, skip);
        
        if (batchTickers.length === 0) {
          hasMoreData = false;
        } else {
          allTickers.push(...batchTickers);
          skip += batchLimit;
          
          logger.info(`Fetched batch of ${batchTickers.length} tickers, total so far: ${allTickers.length}`);
        }
      } catch (error) {
        logger.error(`Error fetching batch of EmojiCoin tickers at skip=${skip}: ${error}`);
        hasMoreData = false;
      }
    }
    
    const result: EmojiCoinTickersResponse = {
      tickers: allTickers.slice(0, maxTickers)
    };
    
    await redisCache.setCache(cacheKey, result, CACHE_TTL_TICKERS);
    
    return result;
  } catch (error) {
    logger.error(`Error in getAllEmojiCoinTickers: ${error}`);
    return {
      tickers: [],
      error: `Failed to get all EmojiCoin tickers: ${error}`
    };
  }
};

/**
 * Get trending emoji coins data
 * @param limit Optional limit for number of trending coins to return
 * @param skipCache Whether to skip checking the cache
 * @returns Trending emoji coins data
 */
export const getTrendingEmojiCoins = async (
  limit: number = 100,
  skipCache: boolean = false
): Promise<EmojiCoinTrendingResponse> => {
  try {
    const cacheKey = redisCache.createCacheKey(CACHE_PREFIX_TRENDING, limit.toString());
    
    if (!skipCache) {
      const cachedData = await redisCache.getCache<EmojiCoinTrendingResponse>(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          cached: true,
          cache_time: new Date().toISOString()
        };
      }
    }
    
    logger.info(`Fetching trending emoji coins data, limit: ${limit}`);
    
    try {
      const response = await fetch('https://www.emojicoin.fun/api/trending');
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json() as EmojiCoinTrending[];
      
      // Apply limit if needed
      const limitedData = limit > 0 ? data.slice(0, limit) : data;
      
      const result: EmojiCoinTrendingResponse = {
        trending_coins: limitedData
      };
      
      await redisCache.setCache(cacheKey, result, CACHE_TTL_TRENDING);
      
      return result;
    } catch (error) {
      logger.error(`Error fetching trending emoji coins: ${error}`);
      return {
        trending_coins: [],
        error: `Failed to fetch trending emoji coins: ${error}`
      };
    }
  } catch (error) {
    logger.error(`Error in getTrendingEmojiCoins: ${error}`);
    return {
      trending_coins: [],
      error: `Failed to get trending emoji coins: ${error}`
    };
  }
};

/**
 * Get historical trades for a specific emoji coin
 * @param marketAddress The market address of the emoji coin (ticker_id)
 * @param startTime Optional unix timestamp for filtering trades after this time
 * @param endTime Optional unix timestamp for filtering trades before this time
 * @param type Optional trade type filter ('buy' or 'sell')
 * @param limit Optional limit for number of trades to return (max 500)
 * @param skip Optional number of records to skip for pagination
 * @param skipCache Whether to skip checking the cache
 * @returns Historical trades for the specified emoji coin
 */
export const getEmojiCoinTrades = async (
  marketAddress: string,
  startTime?: number,
  endTime?: number,
  type?: 'buy' | 'sell',
  limit: number = 500,
  skip: number = 0,
  skipCache: boolean = false
): Promise<EmojiCoinTradesResponse> => {
  try {
    // Validate and enforce max limit
    const validatedLimit = Math.min(Math.max(1, limit), 500);
    const validatedSkip = Math.max(0, skip);
    
    // Create a unique cache key based on all parameters
    const cacheKey = redisCache.createCacheKey(
      CACHE_PREFIX_TRADES, 
      marketAddress, 
      `start_${startTime || 0}`,
      `end_${endTime || 0}`,
      `type_${type || 'all'}`,
      `limit_${validatedLimit}`,
      `skip_${validatedSkip}`
    );
    
    if (!skipCache) {
      const cachedData = await redisCache.getCache<EmojiCoinTradesResponse>(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          cached: true,
          cache_time: new Date().toISOString()
        };
      }
    }
    
    logger.info(`Fetching historical trades for emoji coin: ${marketAddress}, limit: ${validatedLimit}, skip: ${validatedSkip}`);
    
    try {
      // Construct the proper URL for historical trades with all query parameters
      let url = `https://www.emojicoin.fun/api/coingecko/historical_trades?ticker_id=${encodeURIComponent(marketAddress)}`;
      
      // Add optional query parameters if provided
      if (startTime) url += `&start_time=${startTime}`;
      if (endTime) url += `&end_time=${endTime}`;
      if (type) url += `&type=${type}`;
      url += `&limit=${validatedLimit}`;
      url += `&skip=${validatedSkip}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const trades = await response.json() as EmojiCoinTrade[];
      
      const result: EmojiCoinTradesResponse = {
        market_address: marketAddress,
        trades: trades
      };
      
      await redisCache.setCache(cacheKey, result, CACHE_TTL_TRADES);
      
      return result;
    } catch (error) {
      logger.error(`Error fetching emoji coin trades for ${marketAddress}: ${error}`);
      return {
        market_address: marketAddress,
        trades: [],
        error: `Failed to fetch historical trades: ${error}`
      };
    }
  } catch (error) {
    logger.error(`Error in getEmojiCoinTrades: ${error}`);
    return {
      market_address: marketAddress,
      trades: [],
      error: `Failed to get historical trades: ${error}`
    };
  }
};

/**
 * Invalidate cache for trending emoji coins
 */
export const invalidateTrendingEmojiCoinsCache = async (): Promise<void> => {
  try {
    const partialKey = redisCache.createCacheKey(CACHE_PREFIX_TRENDING);
    
    const allKeys = await scanKeys(`${partialKey}*`);
    
    if (allKeys.length > 0) {
      for (const key of allKeys) {
        await redisCache.deleteCache(key);
      }
      logger.info(`Invalidated ${allKeys.length} cache entries for trending emoji coins`);
    }
  } catch (error) {
    logger.error(`Error invalidating trending emoji coins cache: ${error}`);
  }
};

/**
 * Invalidate cache for a specific emoji coin's trades
 * @param marketAddress The market address of the emoji coin
 */
export const invalidateEmojiCoinTradesCache = async (marketAddress: string): Promise<void> => {
  try {
    const partialKey = redisCache.createCacheKey(CACHE_PREFIX_TRADES, marketAddress);
    
    const allKeys = await scanKeys(`${partialKey}*`);
    
    if (allKeys.length > 0) {
      for (const key of allKeys) {
        await redisCache.deleteCache(key);
      }
      logger.info(`Invalidated ${allKeys.length} cache entries for emoji coin trades: ${marketAddress}`);
    }
  } catch (error) {
    logger.error(`Error invalidating emoji coin trades cache: ${error}`);
  }
};

/**
 * Invalidate cache for emoji coin tickers
 */
export const invalidateEmojiCoinTickersCache = async (): Promise<void> => {
  try {
    const partialKey = redisCache.createCacheKey(CACHE_PREFIX_TICKERS);
    
    const allKeys = await scanKeys(`${partialKey}*`);
    
    if (allKeys.length > 0) {
      for (const key of allKeys) {
        await redisCache.deleteCache(key);
      }
      logger.info(`Invalidated ${allKeys.length} cache entries for emoji coin tickers`);
    }
  } catch (error) {
    logger.error(`Error invalidating emoji coin tickers cache: ${error}`);
  }
};

/**
 * Helper function to scan Redis for keys matching a pattern
 * @param pattern The pattern to match
 * @returns Array of matching keys
 */
async function scanKeys(pattern: string): Promise<string[]> {
  try {
    // Get Redis client from the redisCache utility
    const redisClient = redisCache.client;
    if (!redisClient) {
      logger.error('Redis client is not available');
      return [];
    }

    const scanOptions = {
      MATCH: pattern,
      COUNT: 100
    };
    
    const keys: string[] = [];
    let cursor = '0';

    do {
      // @ts-ignore - Redis client types might not be perfect
      const scanResult = await redisClient.scan(cursor, scanOptions);
      cursor = scanResult[0];
      keys.push(...scanResult[1]);
    } while (cursor !== '0');

    return keys;
  } catch (error) {
    logger.error(`Error scanning Redis keys: ${error}`);
    return [];
  }
}

export default {
  getTrendingEmojiCoins,
  getEmojiCoinTrades,
  getAllEmojiCoinTickers,
  invalidateTrendingEmojiCoinsCache,
  invalidateEmojiCoinTradesCache,
  invalidateEmojiCoinTickersCache
}; 