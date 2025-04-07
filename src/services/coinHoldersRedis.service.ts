import logger from '../config/logger';
import CoinClients from './clients';
import redisCache from '../utils/redisCache';
import constants from '../constants';

// Cache expiry time: 5 minutes (300 seconds)
const CACHE_TTL = 300;
const CACHE_PREFIX = 'coin:holders';

/**
 * Interface for Coin Holders response data
 */
interface CoinHoldersData {
  coin_id: string;
  holders: TokenHolder[];
  dev_percentage: string;
  top_holders: TokenHolder[];
  cached?: boolean;
  cache_time?: string;
  error?: string;
}

interface TokenHolder {
  tokenAddr: string;
  holderAddr: string;
  holderName: string;
  percentage: string;
  isDev: boolean;
}


const createCoinHoldersCacheKey = (coinId: string): string => {
  return redisCache.createCacheKey(CACHE_PREFIX, coinId);
};

/**
 * Get coin holders data for a specific coin ID
 * @param coinId The coin ID to get holders for
 * @param skipCache Whether to skip checking the cache
 * @returns Coin holders data for the specified coin
 */
export const getCoinHoldersData = async (
  coinId: string,
  skipCache: boolean = false
): Promise<CoinHoldersData> => {
  try {
    const cacheKey = createCoinHoldersCacheKey(coinId);
    
    if (!skipCache) {
      const cachedData = await redisCache.getCache<CoinHoldersData>(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          cached: true,
          cache_time: new Date().toISOString()
        };
      }
    }
    
    logger.info(`Getting coin holders data for coin: ${coinId}`);
    
    // Find the coin address from coinId
    const address = await findAddressByCoinId(coinId);
    
    if (!address) {
      return {
        coin_id: coinId,
        holders: [],
        dev_percentage: "0%",
        top_holders: [],
        error: 'Could not find associated token address for this coin'
      };
    }
    
    try {
      const holders = await CoinClients.uptosPumpHoldersClient.getTokenHolders(address);
      
      if (holders.length === 0) {
        const emptyResult = {
          coin_id: coinId,
          holders: [],
          dev_percentage: "0%",
          top_holders: []
        };
        
        await redisCache.setCache(cacheKey, emptyResult, CACHE_TTL);
        return emptyResult;
      }
      
      const devPercentage = CoinClients.uptosPumpHoldersClient.calculateDevPercentage(holders);
      const topHolders = CoinClients.uptosPumpHoldersClient.getTopHolders(holders, 5);
      
      const result = {
        coin_id: coinId,
        holders,
        dev_percentage: devPercentage,
        top_holders: topHolders
      };
      
      await redisCache.setCache(cacheKey, result, CACHE_TTL);
      
      return result;
    } catch (error) {
      logger.error(`Error fetching holders for coin ${coinId}: ${error}`);
      return {
        coin_id: coinId,
        holders: [],
        dev_percentage: "0%",
        top_holders: [],
        error: `Failed to fetch holders data: ${error}`
      };
    }
  } catch (error) {
    logger.error(`Error getting coin holders data: ${error}`);
    return {
      coin_id: coinId,
      holders: [],
      dev_percentage: "0%",
      top_holders: [],
      error: `Failed to fetch holders data: ${error}`
    };
  }
};

/**
 * Invalidate cache for a specific coin's holders
 * @param coinId The coin ID to invalidate cache for
 */
export const invalidateCoinHoldersCache = async (coinId: string): Promise<void> => {
  try {
    const cacheKey = createCoinHoldersCacheKey(coinId);
    await redisCache.deleteCache(cacheKey);
    logger.info(`Invalidated cache for coin holders: ${coinId}`);
  } catch (error) {
    logger.error(`Error invalidating coin holders cache: ${error}`);
  }
};

/**
 * Helper function to find coin address by coin ID
 */
async function findAddressByCoinId(coinId: string): Promise<string | null> {
  for (const [address, coinData] of Object.entries(constants.cache.COINS || {})) {
    if (coinData?.coin_id === coinId) {
      return address;
    }
  }
  
  return null;
}

export default {
  getCoinHoldersData,
  invalidateCoinHoldersCache
}; 