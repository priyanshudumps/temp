import express, { Request, Response } from 'express';
import { tokenChartService } from '../services';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const router = express.Router();

/**
 * @route   GET /token-charts/:tokenAddress
 * @desc    Get chart data for a specific token
 * @access  Public
 */
router.get(
  '/:tokenAddress',
  catchAsync(async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    const { 
      timeframe = 'day', 
      limit, 
      startDate, 
      endDate,
      skipCache = 'false'  // Default to using cache
    } = req.query;
    
    if (!tokenAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token address is required');
    }

    if (timeframe && !['day', 'hour', 'minute'].includes(String(timeframe))) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Timeframe must be one of: day, hour, minute'
      );
    }

    let parsedLimit: number | undefined;
    if (limit) {
      parsedLimit = parseInt(String(limit));
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Limit must be a positive number'
        );
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
    
    // Parse skipCache
    const shouldSkipCache = String(skipCache).toLowerCase() === 'true';

    if (parsedStartDate || parsedEndDate) {
      const chartData = await tokenChartService.getTokenChartDataWithDateRange(
        tokenAddress,
        timeframe as 'day' | 'hour' | 'minute',
        parsedStartDate,
        parsedEndDate,
        shouldSkipCache
      );
      res.status(httpStatus.OK).json(chartData);
    } else {
      const chartData = await tokenChartService.getTokenChartData(
        tokenAddress,
        timeframe as 'day' | 'hour' | 'minute',
        parsedLimit,
        shouldSkipCache
      );
      res.status(httpStatus.OK).json(chartData);
    }
  })
);

/**
 * @route   DELETE /token-charts/:tokenAddress/cache
 * @desc    Invalidate cache for a specific token
 * @access  Public (could be restricted in production)
 */
router.delete(
  '/:tokenAddress/cache',
  catchAsync(async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    
    if (!tokenAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token address is required');
    }
    
    await tokenChartService.invalidateTokenChartCache(tokenAddress);
    
    res.status(httpStatus.OK).json({
      message: `Cache invalidated for token ${tokenAddress}`,
      success: true
    });
  })
);

export default router;