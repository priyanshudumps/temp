import methods from '../methods';
import Clients from './clients';
import logger from '../config/logger';
import { IUptosPumpLegend } from '../types/coin.types';

const mapApiResponseToDbModel = (legendData: any): IUptosPumpLegend => {
  const fieldsToCheck = [
    'addr', 'img', 'name', 'ticker', 'description', 'twitter', 'telegram', 'website',
    'virtualAptosReserves', 'virtualTokenReserves', 'initialTokenReserves',
    'createdBy', 'bondingCurve', 'legendTx', 'completedTx', 'lpAddr', 'userAddr', 'userName', 'userImg'
  ];
  
  for (const field of fieldsToCheck) {
    if (legendData[field] && typeof legendData[field] === 'string' && legendData[field].length > 200) {
      logger.info(`Long field detected: ${field} (${legendData[field].length} chars)`);
    }
  }

  return {
    addr: legendData.addr,
    nsfw: legendData.nsfw || false,
    img: legendData.img,
    name: legendData.name,
    ticker: legendData.ticker,
    description: legendData.description,
    twitter: legendData.twitter,
    telegram: legendData.telegram,
    website: legendData.website,
    virtual_aptos_reserves: legendData.virtualAptosReserves,
    virtual_token_reserves: legendData.virtualTokenReserves,
    initial_token_reserves: legendData.initialTokenReserves,
    rep_count: legendData.repC,
    created_by: legendData.createdBy,
    bonding_curve: legendData.bondingCurve,
    created_at: legendData.createdAt ? new Date(legendData.createdAt) : null,
    tx_at: legendData.txAt ? new Date(legendData.txAt) : null,
    tx_count: legendData.txC,
    rep_at: legendData.repAt ? new Date(legendData.repAt) : null,
    legend_at: legendData.legendAt ? new Date(legendData.legendAt) : null,
    legend_tx: legendData.legendTx,
    completed_at: legendData.completedAt ? new Date(legendData.completedAt) : null,
    completed_tx: legendData.completedTx,
    lp_addr: legendData.lpAddr,
    user_addr: legendData.userAddr,
    user_name: legendData.userName,
    user_img: legendData.userImg,
    market_cap: legendData.mCap
  };
};

const fetchAndStoreCurrentLegendToken = async (): Promise<void> => {
  try {
    logger.info("Fetching current legend token from Uptos Pump");
    
    const legendData = await Clients.uptosPumpLegendClient.getLegendTokenData();
    const dbLegendData = mapApiResponseToDbModel(legendData);
    
    logger.info(`Processing legend token: ${dbLegendData.name} (${dbLegendData.addr})`);
    
    try {
      await methods.uptosPumpLegend.addMultipleUptosPumpLegendsOrUpdate([dbLegendData]);
      logger.info("Successfully updated current legend token data");
    } catch (error) {
      logger.error(`DB insertion error: ${(error as Error).message}`);
      
      Object.entries(dbLegendData).forEach(([key, value]) => {
        if (typeof value === 'string') {
          logger.info(`Field ${key}: ${value.length} chars`);
        }
      });
    }
  } catch (error) {
    logger.error(`Error fetching/storing legend token: ${(error as Error).message}`);
  }
};

const fetchAndStoreLegendTokensByAddresses = async (addresses: string[]): Promise<void> => {
  try {
    if (!addresses.length) {
      logger.info("No addresses provided to fetch legend tokens");
      return;
    }
    
    logger.info(`Fetching ${addresses.length} legend tokens by addresses from Uptos Pump`);
    
    const legendTokens: IUptosPumpLegend[] = [];
    
    for (const address of addresses) {
      try {
        const tokenData = await Clients.uptosPumpLegendClient.getTokenDataByAddress(address);
        const dbTokenData = mapApiResponseToDbModel(tokenData);
        legendTokens.push(dbTokenData);
      } catch (error) {
        logger.error(`Error fetching token data for address ${address}: ${(error as Error).message}`);
      }
    }
    
    if (legendTokens.length > 0) {
      await methods.uptosPumpLegend.addMultipleUptosPumpLegendsOrUpdate(legendTokens);
      logger.info(`Successfully updated ${legendTokens.length} legend tokens data`);
    } else {
      logger.info("No legend tokens data to update");
    }
  } catch (error) {
    logger.error(`Error fetching/storing legend tokens by addresses: ${(error as Error).message}`);
  }
};

export default {
  fetchAndStoreCurrentLegendToken,
  fetchAndStoreLegendTokensByAddresses
};