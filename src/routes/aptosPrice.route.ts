import express, { Request, Response } from 'express';
import aptosPriceService from '../services/aptosPrice.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const router = express.Router();

/**
 * @route   GET /aptos-price
 * @desc    Get current APT price in USD
 * @access  Public
 */
router.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    const { skipCache = 'false' } = req.query;
    
    // Parse skipCache
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';
    
    const priceData = await aptosPriceService.getAptosPrice(shouldSkipCache);
    
    if (priceData.error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        priceData.error
      );
    }
    
    res.status(httpStatus.OK).json(priceData);
  })
);

/**
 * @route   DELETE /aptos-price/cache
 * @desc    Invalidate cache for APT price
 * @access  Public (could be restricted in production)
 */
router.delete(
  '/cache',
  catchAsync(async (_req: Request, res: Response) => {
    await aptosPriceService.invalidateAptosPriceCache();
    
    res.status(httpStatus.OK).json({
      message: 'Cache invalidated for APT price',
      success: true
    });
  })
);

export default router; 