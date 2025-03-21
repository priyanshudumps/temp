import config from "../../config/config";
import logger from "../../config/logger";

const BASE_URL = "https://pump.uptos.xyz/token/api";

interface LegendTokenData {
  addr: string;
  nsfw: boolean;
  img: string;
  name: string;
  ticker: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
  virtualAptosReserves: string;
  virtualTokenReserves: string;
  initialTokenReserves: string;
  repC: number;
  createdBy: string;
  bondingCurve: string;
  createdAt: string;
  txAt: string;
  txC: number;
  repAt: string | null;
  legendAt: string;
  legendTx: string;
  completedAt: string;
  completedTx: string;
  lpAddr: string;
  userAddr: string;
  userName: string;
  userImg: string;
  mCap: number;
}

/**
 * Fetches token data from the Uptos Legend API
 * @returns The token data from the legend API
 */
const getLegendTokenData = async (): Promise<LegendTokenData> => {
  try {
    const url = `${BASE_URL}/legend`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`Error fetching legend token data from Uptos: ${error}`);
    throw error;
  }
};

/**
 * Fetches token data by address from the Uptos API
 * @param address The token address to fetch data for
 * @returns The token data for the specified address
 */
const getTokenDataByAddress = async (address: string): Promise<LegendTokenData> => {
  try {
    const url = `${BASE_URL}/token/${address}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`Error fetching token data from Uptos for address ${address}: ${error}`);
    throw error;
  }
};

export {
  getLegendTokenData,
  getTokenDataByAddress,
  type LegendTokenData
};