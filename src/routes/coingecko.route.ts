import express, { Request, Response } from 'express';
import emojiCoinService from '../services/emojiCoin.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const router = express.Router();

/**
 * @route   GET /api/emojicoin/tickers
 * @desc    Get tickers data with pagination (CoinGecko format)
 * @access  Public
 */
router.get(
  '/tickers',
  catchAsync(async (req: Request, res: Response) => {
    const {
      limit = '100',
      skip = '0'
    } = req.query;
    
    let parsedLimit: number;
    let parsedSkip: number;
    
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
    
    // Get all tickers with pagination
    const tickersResponse = await emojiCoinService.getAllEmojiCoinTickers(
      parsedLimit,
      parsedLimit + parsedSkip, 
      false 
    );
    
    if (tickersResponse.error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        tickersResponse.error
      );
    }
    
    // Apply pagination to the tickers
    const paginatedTickers = tickersResponse.tickers.slice(parsedSkip, parsedSkip + parsedLimit);
    
    // Return the tickers as a JSON array
    res.status(httpStatus.OK).json(paginatedTickers);
  })
);

/**
 * @route   GET /api/emojicoin/historical_trades
 * @desc    Get historical trades for a specific emoji coin (CoinGecko format)
 * @access  Public
 */
router.get(
  '/historical_trades',
  catchAsync(async (req: Request, res: Response) => {
    const {
      ticker_id,
      start_time,
      end_time,
      type,
      limit = '500',
      skip = '0'
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
    
    // Use existing service with skipCache set to false to ensure caching works
    const tradesData = await emojiCoinService.getEmojiCoinTrades(
      String(ticker_id),
      parsedStartTime,
      parsedEndTime,
      parsedType,
      parsedLimit,
      parsedSkip,
      false 
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
 * @route   DELETE /api/emojicoin/tickers/cache
 * @desc    Invalidate cache for tickers data
 * @access  Restricted
 */
router.delete(
  '/tickers/cache',
  catchAsync(async (_req: Request, res: Response) => {
    await emojiCoinService.invalidateEmojiCoinTickersCache();
    
    res.status(httpStatus.OK).json({
      message: 'Cache invalidated for emoji coin tickers',
      success: true
    });
  })
);

/**
 * @route   DELETE /api/emojicoin/historical_trades/cache
 * @desc    Invalidate cache for historical trades data
 * @access  Restricted
 */
router.delete(
  '/historical_trades/cache',
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

export default router; 