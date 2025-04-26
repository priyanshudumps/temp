import logger from '../config/logger';
import redisCache from '../utils/redisCache';
import CoinClients from './clients';
import { IEmojiCoinTicker } from './clients/emojiCoinTickers.client';
import fs from 'fs';
import path from 'path';

// Cache expiry time: 2 minutes (120 seconds) for frequently changing data
const CACHE_TTL_TRENDING = 120;
const CACHE_TTL_TRADES = 300; // 5 minutes for historical trades
const CACHE_PREFIX_TRENDING = 'emoji:trending';
const CACHE_PREFIX_TRADES = 'emoji:trades';
const CACHE_PREFIX_TICKERS = 'emoji:tickers';
const CACHE_TTL_TICKERS = 300; // 5 minutes for tickers data
const CACHE_PREFIX_MARKET_TRADES = 'emoji:market_trades';
const CACHE_TTL_MARKET_TRADES = 300; // 5 minutes for market trades data
const CACHE_PREFIX_HOLDERS = 'emoji:holders'; // Add new cache prefix
const CACHE_TTL_HOLDERS = 300; // 5 minutes for holders data

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
 * Interface for emoji coin market trades response
 */
interface EmojiCoinMarketTradesResponse {
  token_address: string;
  market_id?: string;
  trades: any[];
  cached?: boolean;
  cache_time?: string;
  error?: string;
}

/**
 * Interface for emoji coin holders response
 */
interface EmojiCoinHoldersResponse {
  token_address: string;
  holders: {
    owner_address: string;
    amount: string;
    decimals?: number;
    symbol?: string;
  }[];
  total: number;
  cached?: boolean;
  cache_time?: string;
  error?: string;
}

// Helper function to convert emoji to hex
const emojiToHex = (emoji: string): string => {
  // Get the code points
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(emoji);
  
  // Convert bytes to hex string with 0x prefix
  const hexString = '0x' + Array.from(utf8Bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  
  return hexString;
};

// Function to get complete market data from JSON file
export const getCompleteMarketData = (): any[] => {
  try {
    const jsonPath = path.join(__dirname, 'clients', 'emojicoin-complete-market-data.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    logger.error(`Error reading complete market data: ${error}`);
    return [];
  }
};

// Function to find market ID by emoji hex value
export const findMarketIdByEmoji = (emoji: string): string | null => {
  try {
    const marketData = getCompleteMarketData();
    const hexValue = emojiToHex(emoji);
    
    // Find matching market by hex value
    const matchingMarket = marketData.find(market => market.hex === hexValue);
    
    if (matchingMarket) {
      return matchingMarket.marketID;
    }
    
    return null;
  } catch (error) {
    logger.error(`Error finding market ID for emoji: ${error}`);
    return null;
  }
};

// Function to process emoji tickers and update market_id
export const processEmojiCoinMarketIds = async (tickers: IEmojiCoinTicker[]): Promise<IEmojiCoinTicker[]> => {
  const marketData = getCompleteMarketData();
  const processedTickers = tickers.map(ticker => {
    try {
      if (ticker.pool_id) {
        const hexValue = emojiToHex(ticker.pool_id);
        
        // Find matching market by hex value
        const matchingMarket = marketData.find(market => market.hex === hexValue);
        
        if (matchingMarket) {
          return {
            ...ticker,
            market_id: matchingMarket.marketID,
            market_cap_usd: parseFloat(matchingMarket.marketCap) || null
          };
        }
      }
      
      return ticker;
    } catch (error) {
      logger.error(`Error processing market ID for ticker ${ticker.ticker_id}: ${error}`);
      return ticker;
    }
  });
  
  return processedTickers;
};

// Function to update market data JSON with coin addresses
export const updateMarketDataWithAddresses = async (tickers: IEmojiCoinTicker[]): Promise<void> => {
  try {
    const jsonPath = path.join(__dirname, 'clients', 'emojicoin-complete-market-data.json');
    
    // Check if file exists and is accessible
    try {
      fs.accessSync(jsonPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (accessError) {
      logger.error(`Cannot access emojicoin-complete-market-data.json: ${accessError}`);
      return;
    }
    
    const marketData = getCompleteMarketData();
    let updated = false;
    
    // Create a map of emoji hex values to coin addresses from tickers
    const hexToAddressMap = new Map<string, string>();
    let totalEmojis = 0;
    let updatedEmojis = 0;
    let skippedEmojis = 0;
    
    tickers.forEach(ticker => {
      if (ticker.pool_id && ticker.ticker_id) {
        totalEmojis++;
        const hexValue = emojiToHex(ticker.pool_id);
        // Extract the base currency (coin address) from ticker_id
        const baseAddress = ticker.base_currency;
        if (baseAddress) {
          hexToAddressMap.set(hexValue, baseAddress);
        } else {
          skippedEmojis++;
        }
      }
    });
    
    // Update marketData with addresses
    for (const market of marketData) {
      if (hexToAddressMap.has(market.hex)) {
        const newAddress = hexToAddressMap.get(market.hex);
        
        // If coinAddress doesn't exist or is different from the new address
        if (!market.coinAddress || market.coinAddress !== newAddress) {
          market.coinAddress = newAddress;
          updated = true;
          updatedEmojis++;
          logger.debug(`Updated coinAddress for emoji ${market.emoji} (${market.hex}) to ${newAddress}`);
        }
      }
    }
    
    if (updated) {
      // Write updated data back to file
      try {
        // Create a temporary file first to avoid corrupting the original
        const tempPath = `${jsonPath}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(marketData, null, 2), 'utf8');
        
        // Rename temp file to the original file (atomic operation)
        fs.renameSync(tempPath, jsonPath);
        
        logger.info(`Updated emojicoin-complete-market-data.json: ${updatedEmojis} emojis updated, ${skippedEmojis} skipped out of ${totalEmojis} total emojis`);
      } catch (writeError) {
        logger.error(`Error writing to emojicoin-complete-market-data.json: ${writeError}`);
      }
    } else {
      logger.info(`No changes needed in emojicoin-complete-market-data.json. Processed ${totalEmojis} emojis.`);
    }
  } catch (error) {
    logger.error(`Error updating market data with addresses: ${error}`);
  }
};

/**
 * Get all tickers with pagination support
 * @param batchLimit Number of tickers to fetch in each batch
 * @param maxTickers Maximum total tickers to fetch (only used for caching key)
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
    
    logger.info(`Fetching all EmojiCoin tickers `);
    
    const allTickers: IEmojiCoinTicker[] = [];
    let hasMoreData = true;
    let skip = 0;
    
    // Fetch data in batches with pagination until we get an empty response
    while (hasMoreData) {
      try {
        const batchTickers = await CoinClients.emojiCoinTickersClient(batchLimit, skip);
        
        if (batchTickers.length === 0) {
          hasMoreData = false;
          logger.info(`No more tickers found, finished fetching`);
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
      tickers: allTickers
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

/**
 * Find market ID by token address
 * @param tokenAddress The token address to search for
 * @returns Market ID if found, null otherwise
 */
export const findMarketIdByTokenAddress = (tokenAddress: string): string | null => {
  try {
    const marketData = getCompleteMarketData();
    const normalizedAddress = tokenAddress.toLowerCase();
    
    // Find matching market by token address
    const matchingMarket = marketData.find(market => 
      market.coinAddress && market.coinAddress.toLowerCase() === normalizedAddress
    );
    
    if (matchingMarket) {
      return matchingMarket.marketID;
    }
    
    return null;
  } catch (error) {
    logger.error(`Error finding market ID for token address: ${error}`);
    return null;
  }
};

/**
 * Get market trades for a specific token address
 * @param tokenAddress The token address to get trades for
 * @param page Optional page number for pagination
 * @param limit Optional limit for number of trades per page
 * @param skipCache Whether to skip checking the cache
 * @returns Market trades for the specified token
 */
export const getEmojiCoinMarketTrades = async (
  tokenAddress: string,
  page: number = 1,
  limit: number = 100,
  skipCache: boolean = false
): Promise<EmojiCoinMarketTradesResponse> => {
  try {
    // Create a unique cache key
    const cacheKey = redisCache.createCacheKey(
      CACHE_PREFIX_TRADES, 
      'market',
      tokenAddress,
      `page_${page}`,
      `limit_${limit}`
    );
    
    if (!skipCache) {
      const cachedData = await redisCache.getCache<EmojiCoinMarketTradesResponse>(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          cached: true,
          cache_time: new Date().toISOString()
        };
      }
    }
    
    // Look up the market ID for this token address
    const marketId = findMarketIdByTokenAddress(tokenAddress);
    
    if (!marketId) {
      return {
        token_address: tokenAddress,
        trades: [],
        error: `Market ID not found for token address: ${tokenAddress}`
      };
    }
    
    logger.info(`Fetching market trades for token address: ${tokenAddress}, market ID: ${marketId}, page: ${page}`);
    
    try {
      // Construct URL for emojicoin.fun API
      const url = `https://www.emojicoin.fun/api/trades?marketID=${marketId}&page=${page}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const trades = await response.json();
      
      const result: EmojiCoinMarketTradesResponse = {
        token_address: tokenAddress,
        market_id: marketId,
        trades: trades
      };
      
      await redisCache.setCache(cacheKey, result, CACHE_TTL_TRADES);
      
      return result;
    } catch (error) {
      logger.error(`Error fetching emoji coin market trades for ${tokenAddress} (Market ID: ${marketId}): ${error}`);
      return {
        token_address: tokenAddress,
        market_id: marketId,
        trades: [],
        error: `Failed to fetch market trades: ${error}`
      };
    }
  } catch (error) {
    logger.error(`Error in getEmojiCoinMarketTrades: ${error}`);
    return {
      token_address: tokenAddress,
      trades: [],
      error: `Failed to get market trades: ${error}`
    };
  }
};

/**
 * Invalidate cache for a specific token's market trades
 * @param tokenAddress The token address
 */
export const invalidateEmojiCoinMarketTradesCache = async (tokenAddress: string): Promise<void> => {
  try {
    // Get all keys matching the pattern
    const keys = await scanKeys(`${CACHE_PREFIX_MARKET_TRADES}:${tokenAddress}:*`);
    
    // Delete all matching keys
    if (keys.length > 0) {
      await redisCache.client.del(...keys);
      logger.info(`Invalidated ${keys.length} cache entries for emoji coin market trades: ${tokenAddress}`);
    }
  } catch (error) {
    logger.error(`Error invalidating emoji coin market trades cache: ${error}`);
  }
};

/**
 * Get holders data for a specific emoji coin
 * @param assetType - The asset type in format 0x{address}::{module}::Emojicoin
 * @param offset - Offset for pagination
 * @param limit - Number of holders to return
 * @param skipCache - Whether to skip cache
 * @returns Holders data for the emoji coin
 */
export const getEmojiCoinHolders = async (
  assetType: string,
  offset: number = 0,
  limit: number = 100,
  skipCache: boolean = false
): Promise<EmojiCoinHoldersResponse> => {
  const cacheKey = `${CACHE_PREFIX_HOLDERS}:${assetType}:${offset}:${limit}`;
  
  // Check cache first if skipCache is false
  if (!skipCache) {
    const cachedData = await redisCache.getCache<EmojiCoinHoldersResponse>(cacheKey);
    if (cachedData) {
      logger.info(`Retrieved emoji coin holders from cache: ${assetType}`);
      return {
        ...cachedData,
        cached: true,
        cache_time: new Date().toISOString()
      };
    }
  }
  
  try {
    const query = `
      query GetEmojicoinHolders($assetType: String!, $offset: Int = 0, $limit: Int = 100) {
        current_fungible_asset_balances(
          where: {
            _and: [
              { metadata: { token_standard: { _eq: "v1" } } },
              { amount: { _gt: "0" } },
              { asset_type: { _eq: $assetType } }
            ]
          }
          offset: $offset
          limit: $limit
        ) {
          owner_address
          amount
          asset_type
          metadata {
            decimals
            symbol
          }
        }
      }
    `;
    
    const variables = {
      assetType,
      offset,
      limit
    };
    
    const response = await fetch('https://indexer.mainnet.aptoslabs.com/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    
    if (!response.ok) {
      throw new Error(`Aptos indexer GraphQL API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL query error: ${data.errors[0].message}`);
    }
    
    const holders = data.data.current_fungible_asset_balances.map((balance: any) => ({
      owner_address: balance.owner_address,
      amount: balance.amount,
      decimals: balance.metadata?.decimals,
      symbol: balance.metadata?.symbol
    }));
    
    const result: EmojiCoinHoldersResponse = {
      token_address: assetType,
      holders,
      total: holders.length
    };
    
    // Cache the result
    await redisCache.setCache(cacheKey, result, CACHE_TTL_HOLDERS);
    
    return result;
  } catch (error) {
    logger.error(`Error fetching emoji coin holders: ${error}`);
    return {
      token_address: assetType,
      holders: [],
      total: 0,
      error: `Failed to fetch emoji coin holders: ${error}`
    };
  }
};

/**
 * Invalidate cache for a specific emoji coin's holders
 * @param assetType - The asset type in format 0x{address}::{module}::Emojicoin
 */
export const invalidateEmojiCoinHoldersCache = async (assetType: string): Promise<void> => {
  try {
    // Get all keys matching the pattern
    const keys = await scanKeys(`${CACHE_PREFIX_HOLDERS}:${assetType}:*`);
    
    // Delete all matching keys
    if (keys.length > 0) {
      await redisCache.client.del(...keys);
      logger.info(`Invalidated ${keys.length} cache entries for emoji coin holders: ${assetType}`);
    }
  } catch (error) {
    logger.error(`Error invalidating emoji coin holders cache: ${error}`);
  }
};

export default {
  getTrendingEmojiCoins,
  getEmojiCoinTrades,
  getAllEmojiCoinTickers,
  getEmojiCoinMarketTrades,
  invalidateTrendingEmojiCoinsCache,
  invalidateEmojiCoinTradesCache,
  invalidateEmojiCoinTickersCache,
  invalidateEmojiCoinMarketTradesCache,
  getEmojiCoinHolders,
  invalidateEmojiCoinHoldersCache
}; 