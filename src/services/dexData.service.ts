import methods from '../methods';
import CoinClients from './clients';
import constants from '../constants';
import logger from '../config/logger';
import { ICoinDexMetrics } from '../types';

const InsertOrUpdateDataFromDexes = async (): Promise<void> => {
  logger.info("Starting to insert or update dex data from dexscreener.");
  
  try {
    const addresses = Object.keys(constants.cache.COINS);

    let coin_address_fungible_count = 0;

    for (const address of addresses) {
      if (address) {
        coin_address_fungible_count++;
        logger.info(`Processing address ${coin_address_fungible_count}: ${address}`);
        
        try {
          // Try with the primary address first
          let dexscreenerData = await CoinClients.dexscreenerData.fetchCoinDetailsFromAddress(address);
          
          // If primary address returns empty pairs, try with fungible address
          if (dexscreenerData.pairs.length === 0 && 
              constants.cache.COINS[address] && 
              constants.cache.COINS[address].coin_type_legacy) {
            const legacyAddress = constants.cache.COINS[address].coin_type_legacy;
            logger.info(`Empty response for address ${address}, trying with legacy address: ${legacyAddress}`);
            dexscreenerData = await CoinClients.dexscreenerData.fetchCoinDetailsFromAddress(legacyAddress);
          }
          
          if (dexscreenerData.pairs.length > 0) {
            constants.cache.COIN_DEX_METRICS[address] = [];

            // Get the coin_id from the cache (which should match what's in the database)
            const coin_id = constants.cache.COINS[address]?.coin_id;
            
            // Make sure we have a valid coin_id
            if (!coin_id) {
              logger.warn(`No valid coin_id found for address: ${address}, skipping DEX metrics update`);
              continue;
            }

            for (const pair of dexscreenerData.pairs) {

              // Temp check 
              
              // if (coin_id
              //    === "0xbe34691f0388bbca83bafab87399aeb756284e11a2872f1ae74218451cb3899f") {
              //   console.log(pair);
              // }

              const pair_created_at = pair.pairCreatedAt ? new Date(pair.pairCreatedAt) : null;
              
              const dexMetrics: ICoinDexMetrics = {
                coin_id: coin_id,
                pair_id: pair.pairAddress,
                dex: pair.dexId,
                base_token: pair.baseToken?.address,
                quote_token: pair.quoteToken?.address,
                pair_created_at: pair_created_at,

                transactions_m5_buys: pair.txns?.m5?.buys,
                transactions_m5_sells: pair.txns?.m5?.sells,
                transactions_h1_buys: pair.txns?.h1?.buys,
                transactions_h1_sells: pair.txns?.h1?.sells,
                transactions_h6_buys: pair.txns?.h6?.buys,
                transactions_h6_sells: pair.txns?.h6?.sells,
                transactions_h24_buys: pair.txns?.h24?.buys,
                transactions_h24_sells: pair.txns?.h24?.sells,

                volume_usd_24h: pair.volume?.h24,
                volume_usd_6h: pair.volume?.h6,
                volume_usd_1h: pair.volume?.h1,
                volume_usd_5m: pair.volume?.m5,

                price_change_usd_24h: pair.priceChange?.h24,
                price_change_usd_6h: pair.priceChange?.h6,
                price_change_usd_1h: pair.priceChange?.h1,
                price_change_usd_5m: pair.priceChange?.m5,

                liquidity_usd: pair.liquidity?.usd,
                liquidity_base: pair.liquidity?.base,
                liquidity_quote: pair.liquidity?.quote,

                fdv_usd: pair.fdv,
              };
              
              constants.cache.COIN_DEX_METRICS[address].push(dexMetrics);
            }
            
            if (constants.cache.COIN_DEX_METRICS[address].length > 0) {
              try {
                await methods.coinDexMetrics.addCoinMultipleDexMetricsOrUpdate(
                  constants.cache.COIN_DEX_METRICS[address]
                );
                logger.info(`Updated DEX metrics for address ${address} with ${constants.cache.COIN_DEX_METRICS[address].length} pairs`);
              } catch (error) {
                logger.error(`Error updating DEX metrics for address ${address}: ${(error as Error).message}`);
              }
            }
          } else {
            logger.info(`No pairs found for address ${address} or its fungible address`);
          }
        } catch (error) {
          logger.error(`Error processing address ${address}: ${(error as Error).message}`);
        }
      }
    }
    
    logger.info("Finished inserting or updating dex data from dexscreener.");
  } catch (error) {
    logger.error(`Error updating DEX data: ${(error as Error).message}`);
  }
};

export default InsertOrUpdateDataFromDexes;