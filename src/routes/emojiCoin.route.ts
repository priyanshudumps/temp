import express, { Request, Response } from 'express';
import emojiCoinService from '../services/emojiCoin.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const router = express.Router();

/**
 * @route   GET /emoji-coins/trending
 * @desc    Get trending emoji coins data
 * @access  Public
 */
router.get(
  '/trending',
  catchAsync(async (req: Request, res: Response) => {
    const {
      limit = '50',
      skipCache = 'false' // Default to using cache
    } = req.query;
    
    let parsedLimit: number;
    
    try {
      parsedLimit = parseInt(String(limit));
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        throw new Error('Invalid limit');
      }
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Limit must be a non-negative number'
      );
    }
    
    // Parse skipCache
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';
    
    const trendingData = await emojiCoinService.getTrendingEmojiCoins(
      parsedLimit,
      shouldSkipCache
    );
    
    if (trendingData.error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        trendingData.error
      );
    }
    
    res.status(httpStatus.OK).json(trendingData);
  })
);

/**
 * @route   GET /emoji-coins/trades/:marketAddress
 * @desc    Get historical trades for a specific emoji coin
 * @access  Public
 */
router.get(
  '/trades/:marketAddress',
  catchAsync(async (req: Request, res: Response) => {
    const { marketAddress } = req.params;
    const {
      limit = '500',
      skip = '0',
      start_time,
      end_time,
      type,
      skipCache = 'false' 
    } = req.query;
    
    if (!marketAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Market address is required');
    }
    
    let parsedLimit: number;
    let parsedSkip: number;
    let parsedStartTime: number | undefined;
    let parsedEndTime: number | undefined;
    let parsedType: 'buy' | 'sell' | undefined;
    
    // Parse and validate limit
    try {
      parsedLimit = parseInt(String(limit));
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        throw new Error('Invalid limit');
      }
      // Cap limit at 500 as per the API spec
      parsedLimit = Math.min(parsedLimit, 500);
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Limit must be a non-negative number not exceeding 500'
      );
    }
    
    // Parse and validate skip
    try {
      parsedSkip = parseInt(String(skip));
      if (isNaN(parsedSkip) || parsedSkip < 0) {
        throw new Error('Invalid skip');
      }
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Skip must be a non-negative number'
      );
    }
    
    // Parse and validate start_time if provided
    if (start_time) {
      try {
        parsedStartTime = parseInt(String(start_time));
        if (isNaN(parsedStartTime) || parsedStartTime < 0) {
          throw new Error('Invalid start_time');
        }
      } catch (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'start_time must be a valid unix timestamp'
        );
      }
    }
    
    // Parse and validate end_time if provided
    if (end_time) {
      try {
        parsedEndTime = parseInt(String(end_time));
        if (isNaN(parsedEndTime) || parsedEndTime < 0) {
          throw new Error('Invalid end_time');
        }
      } catch (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'end_time must be a valid unix timestamp'
        );
      }
    }
    
    // Validate type if provided
    if (type) {
      const typeStr = String(type).toLowerCase();
      if (typeStr !== 'buy' && typeStr !== 'sell') {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Type must be either "buy" or "sell"'
        );
      }
      parsedType = typeStr as 'buy' | 'sell';
    }
    
    // Parse skipCache
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';
    
    const tradesData = await emojiCoinService.getEmojiCoinTrades(
      marketAddress,
      parsedStartTime,
      parsedEndTime,
      parsedType,
      parsedLimit,
      parsedSkip,
      shouldSkipCache
    );
    
    if (tradesData.error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        tradesData.error
      );
    }
    
    // Format response according to CoinGecko specification - just return the trades array
    res.status(httpStatus.OK).json(tradesData.trades);
  })
);

/**
 * @route   GET /emoji-coins/coingecko/historical_trades
 * @desc    Get historical trades in CoinGecko format
 * @access  Public
 */
router.get(
  '/coingecko/historical_trades',
  catchAsync(async (req: Request, res: Response) => {
    const {
      ticker_id,
      start_time,
      end_time,
      type,
      limit = '500',
      skip = '0',
      skipCache = 'false'
    } = req.query;
    
    if (!ticker_id) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'ticker_id is required');
    }
    
    let parsedLimit: number;
    let parsedSkip: number;
    let parsedStartTime: number | undefined;
    let parsedEndTime: number | undefined;
    let parsedType: 'buy' | 'sell' | undefined;
    
    // Parse and validate limit
    try {
      parsedLimit = parseInt(String(limit));
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        throw new Error('Invalid limit');
      }
      // Cap limit at 500 as per the API spec
      parsedLimit = Math.min(parsedLimit, 500);
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'limit must be a non-negative number not exceeding 500'
      );
    }
    
    // Parse and validate skip
    try {
      parsedSkip = parseInt(String(skip));
      if (isNaN(parsedSkip) || parsedSkip < 0) {
        throw new Error('Invalid skip');
      }
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'skip must be a non-negative number'
      );
    }
    
    // Parse and validate start_time if provided
    if (start_time) {
      try {
        parsedStartTime = parseInt(String(start_time));
        if (isNaN(parsedStartTime) || parsedStartTime < 0) {
          throw new Error('Invalid start_time');
        }
      } catch (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'start_time must be a valid unix timestamp'
        );
      }
    }
    
    // Parse and validate end_time if provided
    if (end_time) {
      try {
        parsedEndTime = parseInt(String(end_time));
        if (isNaN(parsedEndTime) || parsedEndTime < 0) {
          throw new Error('Invalid end_time');
        }
      } catch (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'end_time must be a valid unix timestamp'
        );
      }
    }
    
    // Validate type if provided
    if (type) {
      const typeStr = String(type).toLowerCase();
      if (typeStr !== 'buy' && typeStr !== 'sell') {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'type must be either "buy" or "sell"'
        );
      }
      parsedType = typeStr as 'buy' | 'sell';
    }
    
    // Parse skipCache
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';
    
    const tradesData = await emojiCoinService.getEmojiCoinTrades(
      String(ticker_id),
      parsedStartTime,
      parsedEndTime,
      parsedType,
      parsedLimit,
      parsedSkip,
      shouldSkipCache
    );
    
    if (tradesData.error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        tradesData.error
      );
    }
    
    // Return just the trades array as per CoinGecko specification
    res.status(httpStatus.OK).json(tradesData.trades);
  })
);

/**
 * @route   DELETE /emoji-coins/trending/cache
 * @desc    Invalidate cache for trending emoji coins
 * @access  Public (could be restricted in production)
 */
router.delete(
  '/trending/cache',
  catchAsync(async (_req: Request, res: Response) => {
    await emojiCoinService.invalidateTrendingEmojiCoinsCache();
    
    res.status(httpStatus.OK).json({
      message: 'Cache invalidated for trending emoji coins',
      success: true
    });
  })
);

/**
 * @route   DELETE /emoji-coins/trades/:marketAddress/cache
 * @desc    Invalidate cache for a specific emoji coin's trades
 * @access  Public (could be restricted in production)
 */
router.delete(
  '/trades/:marketAddress/cache',
  catchAsync(async (req: Request, res: Response) => {
    const { marketAddress } = req.params;
    
    if (!marketAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Market address is required');
    }
    
    await emojiCoinService.invalidateEmojiCoinTradesCache(marketAddress);
    
    res.status(httpStatus.OK).json({
      message: `Cache invalidated for emoji coin trades: ${marketAddress}`,
      success: true
    });
  })
);

/**
 * @route   DELETE /emoji-coins/coingecko/historical_trades/cache
 * @desc    Invalidate cache for CoinGecko format trades
 * @access  Public (could be restricted in production)
 */
router.delete(
  '/coingecko/historical_trades/cache',
  catchAsync(async (req: Request, res: Response) => {
    const { ticker_id } = req.query;
    
    if (!ticker_id) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'ticker_id is required');
    }
    
    await emojiCoinService.invalidateEmojiCoinTradesCache(String(ticker_id));
    
    res.status(httpStatus.OK).json({
      message: `Cache invalidated for emoji coin trades with ticker_id: ${ticker_id}`,
      success: true
    });
  })
);

/**
 * @route   GET /emoji-coins/market-trades/:tokenAddress
 * @desc    Get market trades for a specific token address
 * @access  Public
 */
router.get(
  '/market-trades/:tokenAddress',
  catchAsync(async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    const {
      page = '1',
      limit = '100',
      skipCache = 'false' 
    } = req.query;
    
    if (!tokenAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token address is required');
    }
    
    let parsedPage: number;
    let parsedLimit: number;
    
    // Parse and validate page
    try {
      parsedPage = parseInt(String(page));
      if (isNaN(parsedPage) || parsedPage < 1) {
        throw new Error('Invalid page');
      }
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Page must be a positive number'
      );
    }
    
    // Parse and validate limit
    try {
      parsedLimit = parseInt(String(limit));
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new Error('Invalid limit');
      }
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Limit must be a positive number'
      );
    }
    
    // Parse skipCache
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';
    
    const tradesData = await emojiCoinService.getEmojiCoinMarketTrades(
      tokenAddress,
      parsedPage,
      parsedLimit,
      shouldSkipCache
    );
    
    if (tradesData.error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        tradesData.error
      );
    }
    
    res.status(httpStatus.OK).json(tradesData);
  })
);

/**
 * @route   GET /emoji-coins/holders/:tokenAddress
 * @desc    Get holders data for a specific emoji coin
 * @access  Public
 */
router.get(
  '/holders/:tokenAddress',
  catchAsync(async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    const {
      offset = '0',
      limit = '100',
      skipCache = 'false'
    } = req.query;
    
    if (!tokenAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token address is required');
    }
    
    let parsedOffset: number;
    let parsedLimit: number;
    
    // Parse and validate offset
    try {
      parsedOffset = parseInt(String(offset));
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        throw new Error('Invalid offset');
      }
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Offset must be a non-negative number'
      );
    }
    
    // Parse and validate limit
    try {
      parsedLimit = parseInt(String(limit));
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        throw new Error('Invalid limit');
      }
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Limit must be a non-negative number'
      );
    }
    
    // Parse skipCache
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';
    
    const holdersData = await emojiCoinService.getEmojiCoinHolders(
      tokenAddress,
      parsedOffset,
      parsedLimit,
      shouldSkipCache
    );
    
    if (holdersData.error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        holdersData.error
      );
    }
    
    res.status(httpStatus.OK).json(holdersData);
  })
);

/**
 * @route   DELETE /emoji-coins/holders/:tokenAddress/cache
 * @desc    Invalidate cache for a specific token's holders
 * @access  Public (could be restricted in production)
 */
router.delete(
  '/holders/:tokenAddress/cache',
  catchAsync(async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    
    if (!tokenAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token address is required');
    }
    
    await emojiCoinService.invalidateEmojiCoinHoldersCache(tokenAddress);
    
    res.status(httpStatus.OK).json({
      message: `Cache invalidated for token holders: ${tokenAddress}`,
      success: true
    });
  })
);

/**
 * @route   DELETE /emoji-coins/market-trades/:tokenAddress/cache
 * @desc    Invalidate cache for a specific token's market trades
 * @access  Public (could be restricted in production)
 */
router.delete(
  '/market-trades/:tokenAddress/cache',
  catchAsync(async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    
    if (!tokenAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token address is required');
    }
    
    await emojiCoinService.invalidateEmojiCoinMarketTradesCache(tokenAddress);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: `Cache for emoji coin market trades has been invalidated for token: ${tokenAddress}`
    });
  })
);

export default router; 