import config from "../../config/config";
import logger from "../../config/logger";
import axios from 'axios';

const BASE_URL = "https://api.coingecko.com/api/v3";
const PRO_BASE_URL = "https://pro-api.coingecko.com/api/v3";
const HEADERS = {
  Accept: "application/json",
  "x-cg-api-key": config.coingeckoApiKey,
};

interface PriceData {
  [key: string]: {
    usd: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  };
}

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  description?: {
    en: string;
  };
  links?: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url?: {
      github: string[];
      bitbucket: string[];
    };
  };
  image?: {
    thumb: string;
    small: string;
    large: string;
  };
  community_data?: {
    twitter_followers: number;
    reddit_subscribers: number;
    telegram_channel_user_count?: number;
  };
  // Add more properties as needed
}

interface PriceParams {
  ids: string;
  vs_currencies: string;
  include_market_cap?: boolean;
  include_24hr_vol?: boolean;
  include_24hr_change?: boolean;
  include_last_updated_at?: boolean;
  include_ohlc?: boolean;
}

const getPriceByIds = async (ids: string[]): Promise<PriceData> => {
  try {
    const params: PriceParams = {
      ids: ids.join(","),
      vs_currencies: "usd",
      include_market_cap: true,
      include_24hr_vol: true,
      include_24hr_change: true,
      include_last_updated_at: true,
      include_ohlc: true,
    };
    
    const url = `${BASE_URL}/simple/price`;
    const searchParams = new URLSearchParams(params as unknown as Record<string, string>);
    const response = await fetch(`${url}?${searchParams}`, {
      headers: HEADERS,
    });
    
    return await response.json();
  } catch (error) {
    logger.error(`Error fetching coin price data from coingecko: ${error}`);
    return {};
  }
};

interface CoinDataParams {
  localization?: boolean;
  tickers?: boolean;
  market_data?: boolean;
  community_data?: boolean;
  developer_data?: boolean;
  sparkline?: boolean;
}

const getCoinDataById = async (id: string): Promise<CoinData> => {
  const params: CoinDataParams = {
    // id: "aptos",
    localization: false,
    tickers: false,
    market_data: false,
    community_data: true,
    developer_data: false,
    sparkline: false,
  };
  
  const url = `${BASE_URL}/coins/${id}`;
  const searchParams = new URLSearchParams(params as unknown as Record<string, string>);
  console.log(`${url}?${searchParams}`);
  
  const response = await fetch(`${url}?${searchParams}`, { headers: HEADERS });
  return await response.json();
};

/**
 * Get APT price in USD using CoinMarketCap API as a fallback
 * @returns The price of APT in USD
 */
const getAptosPriceFromCoinMarketCap = async (): Promise<number | null> => {
  try {
    const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
    const params = {
      symbol: 'APT',
      convert: 'USD'
    };
    
    const response = await axios.get(url, {
      headers: {
        'X-CMC_PRO_API_KEY': config.coinMarketCapApiKey,
        'Accept': 'application/json'
      },
      params
    });
    
    if (response.status !== 200) {
      throw new Error(`CoinMarketCap API responded with status: ${response.status}`);
    }
    
    const data = response.data;
    
    // Extract the price from the response
    if (data && 
        data.data && 
        data.data.APT && 
        data.data.APT.quote && 
        data.data.APT.quote.USD && 
        data.data.APT.quote.USD.price) {
      return data.data.APT.quote.USD.price;
    }
    
    logger.warn("APT price not found in CoinMarketCap response");
    return null;
  } catch (error) {
    logger.error(`Error fetching APT price from CoinMarketCap: ${error}`);
    return null;
  }
};

/**
 * Get APT price in USD using CoinGecko's free API with fallback to CoinMarketCap
 * @returns The price of APT in USD
 */
const getAptosTokenPrice = async (): Promise<number | null> => {
  try {
    // Try CoinGecko first
    const url = `${BASE_URL}/simple/price`;
    const params = {
      ids: "aptos",
      vs_currencies: "usd"
    };
    
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${url}?${searchParams}`, {
      headers: {
        Accept: "application/json"
      }
    });
    
    if (!response.ok) {
      logger.warn(`CoinGecko API failed with status: ${response.status}. Trying CoinMarketCap...`);
      return await getAptosPriceFromCoinMarketCap();
    }
    
    const data = await response.json();
    
    // Extract the price from the response
    if (data && data.aptos && data.aptos.usd) {
      return data.aptos.usd;
    }
    
    // If CoinGecko data doesn't have what we need, try CoinMarketCap
    logger.warn("APT price not found in CoinGecko response. Trying CoinMarketCap...");
    return await getAptosPriceFromCoinMarketCap();
  } catch (error) {
    logger.error(`Error fetching APT price from CoinGecko: ${error}`);
    // Try CoinMarketCap as fallback
    logger.info('Trying CoinMarketCap as fallback...');
    return await getAptosPriceFromCoinMarketCap();
  }
};

export {
  getPriceByIds,
  getCoinDataById,
  getAptosTokenPrice,
  type PriceData,
  type CoinData
};