import logger from '../config/logger';
import CoinClients from './clients';
import { ICoinChat } from '../types';
import redisCache from '../utils/redisCache';
import constants from '../constants';

// Cache expiry time: 5 minutes (300 seconds)
const CACHE_TTL = 300;
const CACHE_PREFIX = 'coin:chats';

/**
 * Interface for Coin Chats response data
 */
interface CoinChatsData {
  coin_id: string;
  chats: ICoinChat[];
  cached?: boolean;
  cache_time?: string;
  error?: string;
}

/**
 * Create a cache key for coin chats data
 */
const createCoinChatsCacheKey = (
  coinId: string,
  limit?: number,
  offset?: number
): string => {
  return redisCache.createCacheKey(CACHE_PREFIX, coinId, limit?.toString() || 'default', offset?.toString() || '0');
};

/**
 * Get coin chats data for a specific coin ID
 * @param coinId The coin ID to get chats for
 * @param limit Optional limit for the number of chats to return
 * @param offset Optional offset for pagination
 * @param skipCache Whether to skip checking the cache
 * @returns Coin chats data for the specified coin
 */
export const getCoinChatsData = async (
  coinId: string,
  limit: number = 100,
  offset: number = 0,
  skipCache: boolean = false
): Promise<CoinChatsData> => {
  try {
    const cacheKey = createCoinChatsCacheKey(coinId, limit, offset);
    
    if (!skipCache) {
      const cachedData = await redisCache.getCache<CoinChatsData>(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          cached: true,
          cache_time: new Date().toISOString()
        };
      }
    }
    
    logger.info(`Getting coin chats data for coin: ${coinId}, limit: ${limit}, offset: ${offset}`);
    
    // Find the coin address from coinId - this would need to be implemented based on how you map coinId to addresses
    const address = await findAddressByCoinId(coinId);
    
    if (!address) {
      return {
        coin_id: coinId,
        chats: [],
        error: 'Could not find associated token address for this coin'
      };
    }
    
    try {
      const threadsResponse = await CoinClients.uptosPumpChatsClient.getThreadsByTokenAddress(
        address,
        { page: Math.floor(offset / limit) + 1, pageSize: limit }
      );
      
      if (threadsResponse.threads.length === 0) {
        const emptyResult = {
          coin_id: coinId,
          chats: []
        };
        
        await redisCache.setCache(cacheKey, emptyResult, CACHE_TTL);
        return emptyResult;
      }
      
      const chats: ICoinChat[] = threadsResponse.threads.map(thread => ({
        id: thread.id,
        coin_id: coinId,
        content: thread.content,
        image_url: thread.img,
        created_by: thread.createdBy,
        reply_to: thread.replyTo,
        like_count: thread.likeC,
        user_name: thread.userName,
        user_image_url: thread.userImg,
        is_dev: thread.isDev,
        is_liked: thread.liked,
        created_at: new Date(thread.createdAt)
      }));
      
      const result = {
        coin_id: coinId,
        chats
      };
      
      await redisCache.setCache(cacheKey, result, CACHE_TTL);
      
      return result;
    } catch (error) {
      logger.error(`Error fetching chats for coin ${coinId}: ${error}`);
      return {
        coin_id: coinId,
        chats: [],
        error: `Failed to fetch chats data: ${error}`
      };
    }
  } catch (error) {
    logger.error(`Error getting coin chats data: ${error}`);
    return {
      coin_id: coinId,
      chats: [],
      error: `Failed to fetch chats data: ${error}`
    };
  }
};

/**
 * Invalidate cache for a specific coin's chats
 * @param coinId The coin ID to invalidate cache for
 */
export const invalidateCoinChatsCache = async (coinId: string): Promise<void> => {
  try {
    const partialKey = redisCache.createCacheKey(CACHE_PREFIX, coinId);
    
    const allKeys = await scanKeys(`${partialKey}*`);
    
    if (allKeys.length > 0) {
      for (const key of allKeys) {
        await redisCache.deleteCache(key);
      }
      logger.info(`Invalidated ${allKeys.length} cache entries for coin chats: ${coinId}`);
    }
  } catch (error) {
    logger.error(`Error invalidating coin chats cache: ${error}`);
  }
};

/**
 * Helper function to find coin address by coin ID
 */
async function findAddressByCoinId(coinId: string): Promise<string | null> {
  // You need to implement this based on your application's structure
  // This should return the token address needed to fetch chats from the API
  
  for (const [address, coinData] of Object.entries(constants.cache.COINS || {})) {
    if (coinData?.coin_id === coinId) {
      return address;
    }
  }
  
  return null;
}

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
  getCoinChatsData,
  invalidateCoinChatsCache
}; 