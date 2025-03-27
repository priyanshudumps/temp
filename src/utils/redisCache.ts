import Redis from 'ioredis';
import config from '../config/config';
import logger from '../config/logger';

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error(`Redis client error: ${err}`);
});

/**
 * Set data in Redis cache with expiry time
 * @param key Cache key
 * @param data Data to cache (will be JSON stringified)
 * @param expirySeconds Time in seconds before cache expires
 */
export const setCache = async (key: string, data: any, expirySeconds: number): Promise<void> => {
  try {
    await redisClient.set(key, JSON.stringify(data), 'EX', expirySeconds);
    logger.debug(`Cache set for key: ${key}, expires in ${expirySeconds} seconds`);
  } catch (error) {
    logger.error(`Error setting cache for key ${key}: ${error}`);
  }
};

/**
 * Get data from Redis cache
 * @param key Cache key
 * @returns Cached data or null if not found/expired
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(cachedData) as T;
    }
    logger.debug(`Cache miss for key: ${key}`);
    return null;
  } catch (error) {
    logger.error(`Error getting cache for key ${key}: ${error}`);
    return null;
  }
};

/**
 * Remove item from cache
 * @param key Cache key
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
    logger.debug(`Cache deleted for key: ${key}`);
  } catch (error) {
    logger.error(`Error deleting cache for key ${key}: ${error}`);
  }
};

/**
 * @param prefix Key prefix (typically entity type)
 * @param parts Parts to combine into the key
 * @returns Formatted cache key
 */
export const createCacheKey = (prefix: string, ...parts: (string | number)[]): string => {
  return `${prefix}:${parts.join(':')}`;
};

export default {
  client: redisClient,
  setCache,
  getCache,
  deleteCache,
  createCacheKey
};