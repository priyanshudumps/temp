import logger from '../config/logger';
import clients from './clients';
import { OHLCDataPoint, OHLCParams } from './clients/geckoterminalPools.client';
import redisCache from '../utils/redisCache';

// Cache expiry time: 5 minutes (300 seconds)
const CACHE_TTL = 300;
const CACHE_PREFIX = 'token:chart';

/**
 * Interface for Token OHLC chart data
 */
interface TokenChartData {
  token_address: string;
  price_data: OHLCDataPoint[];
  pool_info?: {
    pool_address: string;
    quote_token: string;
    dex: string;
    liquidity_usd: number;
  };
  cached?: boolean;
  cache_time?: string;
  error?: string;
}

/**
 * Create a cache key for token chart data
 */
const createTokenChartCacheKey = (
  tokenAddress: string, 
  timeframe: string, 
  limit?: number
): string => {
  return redisCache.createCacheKey(CACHE_PREFIX, tokenAddress, timeframe, limit || 'default');
};

/**
 * Get OHLC chart data for a token address
 * @param tokenAddress The token address to get chart data for
 * @param timeframe The timeframe for the OHLC data ('day', 'hour', 'minute')
 * @param limit Optional limit for the number of data points to return
 * @param skipCache Whether to skip checking the cache
 * @returns Token chart data with OHLC price points
 */
export const getTokenChartData = async (
  tokenAddress: string,
  timeframe: 'day' | 'hour' | 'minute' = 'day',
  limit?: number,
  skipCache: boolean = false
): Promise<TokenChartData> => {
  try {
    const cacheKey = createTokenChartCacheKey(tokenAddress, timeframe, limit);
    
    if (!skipCache) {
      const cachedData = await redisCache.getCache<TokenChartData>(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          cached: true,
          cache_time: new Date().toISOString()
        };
      }
    }
    
    logger.info(`Getting chart data for token: ${tokenAddress}, timeframe: ${timeframe}`);
    
    const params: OHLCParams = {
      timeframe,
      currency: 'usd', 
      token: 'base',   
    };
    
    if (limit) {
      params.limit = limit;
    }
    
    const bestPool = await clients.geckoterminalPoolsClient.findBestStablecoinPool(tokenAddress);
    
    if (!bestPool) {
      return {
        token_address: tokenAddress,
        price_data: [],
        error: 'No suitable liquidity pool found for this token'
      };
    }
    
    const ohlcData = await clients.geckoterminalPoolsClient.getPoolOHLCData(
      bestPool.attributes.address,
      params
    );
    
    const quoteTokenId = bestPool.relationships.quote_token.data.id;
    const quoteToken = quoteTokenId.split('_').pop() || 'Unknown';
    
    const dexName = bestPool.relationships.dex.data.id;
    
    const liquidityUsd = typeof bestPool.attributes.reserve_in_usd === 'string'
      ? parseFloat(bestPool.attributes.reserve_in_usd)
      : bestPool.attributes.reserve_in_usd as number;
    
    const result = {
      token_address: tokenAddress,
      price_data: ohlcData,
      pool_info: {
        pool_address: bestPool.attributes.address,
        quote_token: quoteToken,
        dex: dexName,
        liquidity_usd: liquidityUsd
      }
    };
    
    await redisCache.setCache(cacheKey, result, CACHE_TTL);
    
    return result;
  } catch (error) {
    logger.error(`Error getting token chart data: ${error}`);
    return {
      token_address: tokenAddress,
      price_data: [],
      error: `Failed to fetch chart data: ${error}`
    };
  }
};

/**
 * Get token chart data with custom date range filtering
 * @param tokenAddress The token address to get chart data for
 * @param timeframe The timeframe for the OHLC data
 * @param startDate Optional start date to filter data
 * @param endDate Optional end date to filter data
 * @param skipCache Whether to skip checking the cache
 * @returns Token chart data filtered by date range
 */
export const getTokenChartDataWithDateRange = async (
  tokenAddress: string,
  timeframe: 'day' | 'hour' | 'minute' = 'day',
  startDate?: Date,
  endDate?: Date,
  skipCache: boolean = false
): Promise<TokenChartData> => {
  try {
    // Create cache key with date range
    const startTimestamp = startDate ? startDate.getTime() : 'none';
    const endTimestamp = endDate ? endDate.getTime() : 'none';
    const cacheKey = redisCache.createCacheKey(
      CACHE_PREFIX, 
      tokenAddress, 
      timeframe, 
      'range', 
      startTimestamp, 
      endTimestamp
    );
    
    if (!skipCache) {
      const cachedData = await redisCache.getCache<TokenChartData>(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          cached: true,
          cache_time: new Date().toISOString()
        };
      }
    }
    
    const chartData = await getTokenChartData(tokenAddress, timeframe, undefined, skipCache);
    
    if (chartData.error || !chartData.price_data.length) {
      return chartData;
    }
    
    if (!startDate && !endDate) {
      return chartData;
    }
    
    // Filter data points by date range
    const filteredData = chartData.price_data.filter(point => {
      const pointDate = new Date(point.timestamp * 1000); // Convert timestamp to date
      
      if (startDate && endDate) {
        return pointDate >= startDate && pointDate <= endDate;
      } else if (startDate) {
        return pointDate >= startDate;
      } else if (endDate) {
        return pointDate <= endDate;
      }
      
      return true;
    });
    
    const result = {
      ...chartData,
      price_data: filteredData
    };
    
    // Save to cache with 5-minute expiry
    await redisCache.setCache(cacheKey, result, CACHE_TTL);
    
    return result;
  } catch (error) {
    logger.error(`Error filtering token chart data by date range: ${error}`);
    return {
      token_address: tokenAddress,
      price_data: [],
      error: `Failed to filter chart data: ${error}`
    };
  }
};

/**
 * @param tokenAddress The token address to invalidate cache for
 */
export const invalidateTokenChartCache = async (tokenAddress: string): Promise<void> => {
  try {
    const partialKey = redisCache.createCacheKey(CACHE_PREFIX, tokenAddress);
    
    const allKeys = await scanKeys(`${partialKey}*`);
    
    if (allKeys.length > 0) {
      for (const key of allKeys) {
        await redisCache.deleteCache(key);
      }
      logger.info(`Invalidated ${allKeys.length} cache entries for token: ${tokenAddress}`);
    }
  } catch (error) {
    logger.error(`Error invalidating token chart cache: ${error}`);
  }
};


async function scanKeys(pattern: string): Promise<string[]> {
  let cursor = '0';
  const foundKeys: string[] = [];
  
  do {
    // Scan with cursor
    const [nextCursor, keys] = await redisCache.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    
    // Add found keys
    if (keys.length > 0) {
      foundKeys.push(...keys);
    }
  } while (cursor !== '0'); 
  
  return foundKeys;
}

export default {
  getTokenChartData,
  getTokenChartDataWithDateRange,
  invalidateTokenChartCache
};