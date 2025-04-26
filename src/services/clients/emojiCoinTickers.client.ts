import logger from '../../config/logger';

/**
 * Interface for EmojiCoin ticker data
 */
export interface IEmojiCoinTicker {
  ticker_id: string;
  base_currency: string;
  target_currency: string;
  pool_id: string;
  last_price: string;
  base_volume: string;
  target_volume: string;
  liquidity_in_usd: string;
  market_id?: string;
  market_cap_usd?: number;
}

/**
 * Fetch EmojiCoin data from the tickers API endpoint
 * @param limit Optional limit parameter (max 500)
 * @param skip Optional skip parameter for pagination
 * @returns Array of EmojiCoin tickers
 */
const fetchEmojiCoinTickers = async (
  limit: number = 500,
  skip: number = 0
): Promise<IEmojiCoinTicker[]> => {
  try {
    const url = `https://www.emojicoin.fun/api/coingecko/tickers?limit=${limit}&skip=${skip}`;
    logger.info(`Fetching EmojiCoin tickers data from ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json() as IEmojiCoinTicker[];
    logger.info(`Successfully fetched ${data.length} EmojiCoin tickers`);
    
    return data;
  } catch (error) {
    logger.error(`Error fetching EmojiCoin tickers: ${error}`);
    return [];
  }
};

export default fetchEmojiCoinTickers; 