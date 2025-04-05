import express, { Request, Response } from 'express';
import coinChatsRedisService from '../services/coinChatsRedis.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const router = express.Router();

/**
 * @route   GET /coin-chats/:coinId
 * @desc    Get chat data for a specific coin
 * @access  Public
 */
router.get(
  '/:coinId',
  catchAsync(async (req: Request, res: Response) => {
    const { coinId } = req.params;
    const {
      limit = '100',
      offset = '0',
      skipCache = 'false' 
    } = req.query;
    
    if (!coinId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coin ID is required');
    }

    let parsedLimit: number;
    let parsedOffset: number;
    
    try {
      parsedLimit = parseInt(String(limit));
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        throw new Error('Invalid limit');
      }
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Limit must be a positive number'
      );
    }
    
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
    
    // Parse skipCache
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';
    
    const chatsData = await coinChatsRedisService.getCoinChatsData(
      coinId,
      parsedLimit,
      parsedOffset,
      shouldSkipCache
    );
    
    if (chatsData.error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        chatsData.error
      );
    }
    
    res.status(httpStatus.OK).json(chatsData);
  })
);

/**
 * @route   DELETE /coin-chats/:coinId/cache
 * @desc    Invalidate cache for a specific coin's chats
 * @access  Public (could be restricted in production)
 */
router.delete(
  '/:coinId/cache',
  catchAsync(async (req: Request, res: Response) => {
    const { coinId } = req.params;
    
    if (!coinId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coin ID is required');
    }
    
    await coinChatsRedisService.invalidateCoinChatsCache(coinId);
    
    res.status(httpStatus.OK).json({
      message: `Cache invalidated for coin ${coinId}`,
      success: true
    });
  })
);

export default router; 