import express, { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import clients from '../services/clients';
import redisCache from '../utils/redisCache';

const router = express.Router();

// Cache expiry time: 5 minutes (300 seconds)
const CACHE_TTL = 300;
const CACHE_PREFIX = 'uptos:pump:chart';

interface ChartCacheData {
  token_address: string;
  price_data: any[];
  source: string;
}

/**
 * @route   GET /uptos-pump-charts/:tokenAddress
 * @desc    Get Uptos Pump chart data for a specific token
 * @access  Public
 */
router.get(
  '/:tokenAddress',
  catchAsync(async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    const { 
      skipCache = 'false',
      startDate,
      endDate
    } = req.query;
    
    if (!tokenAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token address is required');
    }
    
    // Parse skipCache
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';
    
    // Create cache key
    const cacheKey = redisCache.createCacheKey(CACHE_PREFIX, tokenAddress);
    
    // Try to get from cache first
    if (!shouldSkipCache) {
      const cachedData = await redisCache.getCache<ChartCacheData>(cacheKey);
      if (cachedData) {
        return res.status(httpStatus.OK).json({
          token_address: tokenAddress,
          price_data: cachedData.price_data || [],
          source: 'uptos_pump',
          cached: true,
          cache_time: new Date().toISOString()
        });
      }
    }
    
    // Parse dates if provided
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(String(startDate));
      if (isNaN(parsedStartDate.getTime())) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Invalid start date format'
        );
      }
    }

    if (endDate) {
      parsedEndDate = new Date(String(endDate));
      if (isNaN(parsedEndDate.getTime())) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Invalid end date format'
        );
      }
    }

    // Fetch data from Uptos Pump
    try {
      let chartData;
      
      if (parsedStartDate || parsedEndDate) {
        chartData = await clients.uptosPumpChartsClient.getTokenChartDataWithDateRange(
          tokenAddress,
          parsedStartDate,
          parsedEndDate
        );
      } else {
        chartData = await clients.uptosPumpChartsClient.getTokenChartData(tokenAddress);
      }
      
      // Format response
      const result = {
        token_address: tokenAddress,
        price_data: chartData,
        source: 'uptos_pump'
      };
      
      // Cache the result
      await redisCache.setCache(cacheKey, result, CACHE_TTL);
      
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch Uptos Pump chart data: ${error.message}`
      );
    }
  })
);

/**
 * @route   DELETE /uptos-pump-charts/:tokenAddress/cache
 * @desc    Invalidate cache for Uptos Pump chart data
 * @access  Public
 */
router.delete(
  '/:tokenAddress/cache',
  catchAsync(async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    
    if (!tokenAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token address is required');
    }
    
    const cacheKey = redisCache.createCacheKey(CACHE_PREFIX, tokenAddress);
    await redisCache.deleteCache(cacheKey);
    
    res.status(httpStatus.OK).json({
      message: `Cache invalidated for Uptos Pump token ${tokenAddress}`,
      success: true
    });
  })
);

export default router; 