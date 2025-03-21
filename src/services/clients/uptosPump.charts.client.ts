import config from "../../config/config";
import logger from "../../config/logger";

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
 * Gets chart data for a specific token
 * @param tokenAddress The full token address
 * @returns Array of chart data points
 */
const getTokenChartData = async (tokenAddress: string): Promise<ChartData> => {
  try {
    const url = `${BASE_URL}/token/${tokenAddress}/api/chart`;
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chart data: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`Error fetching token chart data: ${error}`);
    return [];
  }
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