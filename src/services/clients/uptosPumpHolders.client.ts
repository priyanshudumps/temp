import logger from '../../config/logger';

const BASE_URL = "https://pump.uptos.xyz";

interface TokenHolder {
  tokenAddr: string;
  holderAddr: string;
  holderName: string;
  percentage: string;
  isDev: boolean;
}

/**
 * Sleep function to pause execution
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches token holder data with retry logic and error handling
 * @param tokenAddr The token address to get holders for
 * @param maxRetries Number of retry attempts
 * @param delayMs Delay between retries in milliseconds
 * @returns Array of TokenHolder objects or empty array if failed
 */
const getTokenHolders = async (
  tokenAddr: string,
  maxRetries = 3,
  delayMs = 1000
): Promise<TokenHolder[]> => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const url = `${BASE_URL}/token/${tokenAddr}/api/holders`;
      
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
        throw new Error(`API responded with status: ${response.status}`);
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
      logger.warn(`Attempt ${attempts}/${maxRetries} failed for token holders ${tokenAddr}: ${error.message}`);
      
      if (attempts >= maxRetries) {
        logger.error(`All ${maxRetries} attempts failed for token holders ${tokenAddr}`);
        return [];
      }
      
      await sleep(delayMs);
      delayMs *= 1.5;
    }
  }
  
  return [];
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