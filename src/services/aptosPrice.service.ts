import logger from '../config/logger';
import redisCache from '../utils/redisCache';
import { getAptosTokenPrice } from './clients/coingecko.client';

// Cache keys and TTL
const CACHE_PREFIX_APT_PRICE = 'apt:price';
const CACHE_TTL_APT_PRICE = 300; // 5 minutes

/**
 * Interface for APT price response
 */
interface AptosPriceResponse {
  price: number | null;
  timestamp: string;
  cached?: boolean;
  cache_time?: string;
  error?: string;
}

/**
 * Get current APT price in USD
 * @param skipCache Whether to skip checking the cache
 * @returns APT price in USD
 */
export const getAptosPrice = async (
  skipCache: boolean = false
): Promise<AptosPriceResponse> => {
  const cacheKey = redisCache.createCacheKey(CACHE_PREFIX_APT_PRICE, 'usd');
  
  // Check cache first if skipCache is false
  if (!skipCache) {
    const cachedData = await redisCache.getCache<AptosPriceResponse>(cacheKey);
    if (cachedData) {
      logger.info('Retrieved APT price from cache');
      return {
        ...cachedData,
        cached: true,
        cache_time: new Date().toISOString()
      };
    }
  }
  
  try {
    const price = await getAptosTokenPrice();
    
    const result: AptosPriceResponse = {
      price,
      timestamp: new Date().toISOString()
    };
    
    // Cache the result if we got a valid price
    if (price !== null) {
      await redisCache.setCache(cacheKey, result, CACHE_TTL_APT_PRICE);
    }
    
    return result;
  } catch (error) {
    logger.error(`Error fetching APT price: ${error}`);
    return {
      price: null,
      timestamp: new Date().toISOString(),
      error: `Failed to fetch APT price: ${error}`
    };
  }
};

/**
 * Invalidate cache for APT price
 */
export const invalidateAptosPriceCache = async (): Promise<void> => {
  try {
    const cacheKey = redisCache.createCacheKey(CACHE_PREFIX_APT_PRICE, 'usd');
    await redisCache.deleteCache(cacheKey);
    logger.info('Invalidated APT price cache');
  } catch (error) {
    logger.error(`Error invalidating APT price cache: ${error}`);
  }
};

export default {
  getAptosPrice,
  invalidateAptosPriceCache
}; 