import logger from '../../config/logger';

const BASE_URL = "https://pump.uptos.xyz";

interface ChartDataPoint {
  date: string;
  low: number;
  high: number;
  open: number;
  close: number;
  buyC: number;
  sellC: number;
}

type ChartData = ChartDataPoint[];

/**
 * Sleep function to pause execution
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gets chart data for a specific token with retry logic and error handling
 * @param tokenAddress The full token address
 * @param maxRetries Number of retry attempts
 * @param delayMs Delay between retries in milliseconds
 * @returns Array of chart data points or empty array if failed
 */
const getTokenChartData = async (
  tokenAddress: string, 
  maxRetries = 3, 
  delayMs = 1000
): Promise<ChartData> => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const url = `${BASE_URL}/token/${tokenAddress}/api/chart`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid content type: ${contentType}. Expected JSON.`);
      }
      
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          return data;
        } else {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        throw new Error(`JSON Parse error: ${parseError.message}. Response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      attempts++;
      logger.warn(`Attempt ${attempts}/${maxRetries} failed for chart data ${tokenAddress}: ${error.message}`);
      
      if (attempts >= maxRetries) {
        logger.error(`All ${maxRetries} attempts failed for chart data ${tokenAddress}`);
        return [];
      }
      
      // Wait before retrying
      await sleep(delayMs);
      // Increase delay for subsequent attempts
      delayMs *= 1.5;
    }
  }
  
  return [];
};

/**
 * Gets chart data for a token with optional date range filtering
 * @param tokenAddress The full token address
 * @param startDate Optional start date to filter chart data
 * @param endDate Optional end date to filter chart data
 * @returns Filtered array of chart data points
 */
const getTokenChartDataWithDateRange = async (
  tokenAddress: string, 
  startDate?: Date, 
  endDate?: Date
): Promise<ChartData> => {
  try {
    const chartData = await getTokenChartData(tokenAddress);
    
    if (!startDate && !endDate) {
      return chartData;
    }
    
    return chartData.filter(dataPoint => {
      const pointDate = new Date(dataPoint.date);
      
      if (startDate && endDate) {
        return pointDate >= startDate && pointDate <= endDate;
      } else if (startDate) {
        return pointDate >= startDate;
      } else if (endDate) {
        return pointDate <= endDate;
      }
      
      return true;
    });
  } catch (error) {
    logger.error(`Error filtering token chart data: ${error}`);
    return [];
  }
};

export {
  getTokenChartData,
  getTokenChartDataWithDateRange,
  type ChartData,
  type ChartDataPoint
};