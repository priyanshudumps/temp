import config from "../../config/config";
import logger from "../../config/logger";

const BASE_URL = "https://pump.uptos.xyz";

interface TokenHolder {
  tokenAddr: string;
  holderAddr: string;
  holderName: string;
  percentage: string;
  isDev: boolean;
}

/**
 * Fetches token holder data for a specific token address
 * @param tokenAddr The token address to get holders for
 * @returns Array of TokenHolder objects with holder information
 */
const getTokenHolders = async (tokenAddr: string): Promise<TokenHolder[]> => {
  try {
    const url = `${BASE_URL}/token/${tokenAddr}/api/holders`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`Error fetching token holders data: ${error}`);
    return [];
  }
};

/**
 * Calculates total percentage held by developer wallets
 * @param holders Array of TokenHolder objects
 * @returns Percentage of token held by developers as a string
 */
const calculateDevPercentage = (holders: TokenHolder[]): string => {
  const devPercentage = holders
    .filter(holder => holder.isDev)
    .reduce((total, holder) => {
      // Convert percentage string like "91.71%" to number
      const percentValue = parseFloat(holder.percentage.replace('%', ''));
      return total + percentValue;
    }, 0);
    
  return `${devPercentage.toFixed(2)}%`;
};

/**
 * Gets the top holders by percentage held
 * @param holders Array of TokenHolder objects
 * @param limit Number of top holders to return
 * @returns Array of top TokenHolder objects
 */
const getTopHolders = (holders: TokenHolder[], limit = 5): TokenHolder[] => {
  return [...holders]
    .sort((a, b) => {
      const percentA = parseFloat(a.percentage.replace('%', ''));
      const percentB = parseFloat(b.percentage.replace('%', ''));
      return percentB - percentA;
    })
    .slice(0, limit);
};

export {
  getTokenHolders,
  calculateDevPercentage,
  getTopHolders,
  type TokenHolder
};