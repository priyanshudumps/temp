import CoinClients from './clients';
import constants from '../constants';
import logger from '../config/logger';
import { ICoinChat } from '../types';
import redisCache from '../utils/redisCache';

// Cache expiry time: 5 minutes (300 seconds)
const CACHE_TTL = 300;
const CACHE_PREFIX = 'coin:chats';

const InsertOrUpdateCoinChatsData = async (): Promise<void> => {
  logger.info("Starting to fetch and cache coin chats data from Uptos Pump");
  
  try {
    const addresses = Object.keys(constants.cache.COINS);
    
    for (const address of addresses) {
      if (!address.includes('::')) {
        continue;
      }
      
      try {
        const coin_id = constants.cache.COINS[address]?.coin_id;
        
        if (!coin_id) {
          logger.warn(`No valid coin_id found for address: ${address}, skipping chats update`);
          continue;
        }
        
        const threadsResponse = await CoinClients.uptosPumpChatsClient.getThreadsByTokenAddress(
          address,
          { page: 1, pageSize: 100 }
        );
        
        if (threadsResponse.threads.length === 0) {
          continue;
        }
        
        if (!constants.cache.COIN_CHATS[coin_id]) {
          constants.cache.COIN_CHATS[coin_id] = [];
        }
        
        const coinChatsData: ICoinChat[] = [];
        
        for (const thread of threadsResponse.threads) {
          const chatData: ICoinChat = {
            id: thread.id,
            coin_id,
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
          };
          
          coinChatsData.push(chatData);
          constants.cache.COIN_CHATS[coin_id].push(chatData);
        }
        
        // Instead of saving to PostgreSQL, store in Redis cache
        if (coinChatsData.length > 0) {
          const cacheKey = redisCache.createCacheKey(CACHE_PREFIX, coin_id, 'default', '0');
          
          await redisCache.setCache(cacheKey, {
            coin_id: coin_id,
            chats: coinChatsData
          }, CACHE_TTL);
          
          logger.info(`Cached ${coinChatsData.length} chats for coin ${coin_id} in Redis`);
        }
        
      } catch (error) {
        logger.error(`Error fetching chats for address ${address}: ${(error as Error).message}`);
      }
    }
    
    logger.info("Finished caching coin chats data");
  } catch (error) {
    logger.error(`Error updating coin chats data: ${(error as Error).message}`);
  }
};

export default {
  InsertOrUpdateCoinChatsData
};