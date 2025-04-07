import express, { Request, Response } from 'express';
import coinHoldersRedisService from '../services/coinHoldersRedis.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const router = express.Router();

/**
 * @route   GET /coin-holders/:coinId
 * @desc    Get holders data for a specific coin
 * @access  Public
 */
router.get(
  '/:coinId',
  catchAsync(async (req: Request, res: Response) => {
    const { coinId } = req.params;
    const { skipCache = 'false' } = req.query;
    
    if (!coinId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coin ID is required');
    }
    
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';
    
    const holdersData = await coinHoldersRedisService.getCoinHoldersData(
      coinId,
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
 * @route   DELETE /coin-holders/:coinId/cache
 * @desc    Invalidate cache for a specific coin's holders
 * @access  Public (could be restricted in production)
 */
router.delete(
  '/:coinId/cache',
  catchAsync(async (req: Request, res: Response) => {
    const { coinId } = req.params;
    
    if (!coinId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coin ID is required');
    }
    
    await coinHoldersRedisService.invalidateCoinHoldersCache(coinId);
    
    res.status(httpStatus.OK).json({
      message: `Cache invalidated for coin ${coinId}`,
      success: true
    });
  })
);

export default router; 