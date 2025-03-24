import methods from '../methods';
import CoinClients from './clients';
import constants from '../constants';
import logger from '../config/logger';
import { ICoin, ICoinLinks, ICoinScore, ICoinMetrics } from '../types';

const InsertOrUpdateDataFromCoinLists = async (): Promise<void> => {
  logger.info("Starting to gather API data for all tokens in Panora coin list");
  
  try {
    const panoraCoinList = await CoinClients.panoraCoinClient();
    console.log(panoraCoinList[0]);

    for (const coin of panoraCoinList) {
      // since tokenaddress can be null using faAddress as the key
      if (!constants.cache.COINS[coin.faAddress]) {
        constants.cache.COINS[coin.faAddress] = {} as ICoin;
      }
      if (!constants.cache.COIN_SCORE[coin.faAddress]) {
        constants.cache.COIN_SCORE[coin.faAddress] = {} as ICoinScore;
      }
      if (!constants.cache.COIN_LINKS[coin.faAddress]) {
        constants.cache.COIN_LINKS[coin.faAddress] = {} as ICoinLinks;
      }

      const coin_type_legacy = coin?.tokenAddress?.includes("::")
        ? coin.tokenAddress
        : constants.cache.COINS[coin.tokenAddress]
        ? constants.cache.COINS[coin.tokenAddress].coin_type_legacy
          ? constants.cache.COINS[coin.tokenAddress].coin_type_legacy
          : null
        : null;
      
      const coin_address_fungible = coin?.tokenAddress?.includes("::")
        ? null
        : constants.cache.COINS[coin.tokenAddress]
        ? constants.cache.COINS[coin.tokenAddress].coin_address_fungible
          ? constants.cache.COINS[coin.tokenAddress].coin_address_fungible
          : null
        : null;
      
      // sets coin id as faAddress if it exists, otherwise it's tokenAddress
      const hasFungibleAddress = Boolean(coin.faAddress);
      if (hasFungibleAddress) {
        constants.cache.COINS[coin.faAddress].coin_id = coin.faAddress;
        constants.cache.COIN_SCORE[coin.faAddress].coin_id = coin.faAddress;
        constants.cache.COIN_LINKS[coin.faAddress].coin_id = coin.faAddress;
      } else {
        constants.cache.COINS[coin.tokenAddress].coin_id = coin.tokenAddress;
        constants.cache.COIN_SCORE[coin.tokenAddress].coin_id = coin.tokenAddress;
        constants.cache.COIN_LINKS[coin.tokenAddress].coin_id = coin.tokenAddress;
      }

      constants.cache.COINS[coin.faAddress].coin_type_legacy = coin.tokenAddress;
      constants.cache.COINS[coin.faAddress].coin_address_fungible = coin.faAddress;
      constants.cache.COINS[coin.faAddress].coin_name = coin.name;
      constants.cache.COINS[coin.faAddress].coin_symbol = coin.symbol;
      constants.cache.COINS[coin.faAddress].coin_defyapp_symbol = coin.panoraSymbol;
      constants.cache.COINS[coin.faAddress].coin_decimals = coin.decimals;
      constants.cache.COINS[coin.faAddress].coin_logo_url = coin.logoUrl;
      constants.cache.COINS[coin.faAddress].coingecko_id = coin.coinGeckoId;
      constants.cache.COINS[coin.faAddress].coinmarketcap_id = coin.coinMarketCapId;

      constants.cache.COIN_SCORE[coin.faAddress].is_banned_panora = coin.isBanned;

      constants.cache.COIN_LINKS[coin.faAddress].website = coin.websiteUrl;
    }

    const CoinsArray = Object.values(constants.cache.COINS);
    const CoinScoresArray = Object.values(constants.cache.COIN_SCORE);
    const CoinLinksArray = Object.values(constants.cache.COIN_LINKS);

    // this is outside promise.all because we need to wait
    // for coins to be inserted first so that we do not violate foreign key constraints
    // if any new coin is added
    await methods.coins.addMultipleCoinsOrUpdate(CoinsArray);
    await Promise.all([
      methods.coinLinks.addMultipleCoinLinksOrUpdate(CoinLinksArray),
      methods.coinScores.addMultipleCoinScoresOrUpdate(CoinScoresArray),
    ]);
    
    logger.info("Finished inserting or updating coin data from hippo and panora.");
  } catch (error) {
    logger.error(`Error updating coin list data from panora: ${(error as Error).message}`);
  }
  
  logger.info("Starting to gather API data for all tokens in Uptos Pump coin list");

  try {
    const uptosPumpCoinList = await CoinClients.uptosPumpClient();
    console.log(uptosPumpCoinList[0]);
    
    for (const coin of uptosPumpCoinList) {
      // Use addr as the coin_id for Uptos Pump coins
      const coinId = coin.addr;
      
      if (!coinId) {
        logger.warn(`Skipping Uptos Pump coin with missing address: ${coin.name}`);
        continue;
      }
      
      if (!constants.cache.COINS[coinId]) {
        constants.cache.COINS[coinId] = {} as ICoin;
      }
      if (!constants.cache.COIN_SCORE[coinId]) {
        constants.cache.COIN_SCORE[coinId] = {} as ICoinScore;
      }
      if (!constants.cache.COIN_LINKS[coinId]) {
        constants.cache.COIN_LINKS[coinId] = {} as ICoinLinks;
      }
      if (!constants.cache.COIN_METRICS[coinId]) {
        constants.cache.COIN_METRICS[coinId] = {} as ICoinMetrics;
      }
      
      let price_apt = 0;
      if (coin.virtualAptosReserves && coin.virtualTokenReserves) {
        try {
          const virtualAptosReservesBigInt = BigInt(coin.virtualAptosReserves);
          const virtualTokenReservesBigInt = BigInt(coin.virtualTokenReserves);
          
          price_apt = Number(
            (virtualAptosReservesBigInt * BigInt(100000000)) / 
            (virtualTokenReservesBigInt + BigInt(100000000))
          );
        } catch (e) {
          logger.error(`Error calculating price for coin ${coinId}: ${(e as Error).message}`);
        }
      }
      
      constants.cache.COINS[coinId].coin_id = coinId;
      constants.cache.COINS[coinId].coin_type_legacy = coinId;
      constants.cache.COINS[coinId].coin_name = coin.name;
      constants.cache.COINS[coinId].coin_symbol = coin.ticker;
      constants.cache.COINS[coinId].coin_decimals = 8; // Default for Aptos coins if not specified
      constants.cache.COINS[coinId].coin_description = coin.description;
      constants.cache.COINS[coinId].coin_logo_url = coin.img;
      
      constants.cache.COIN_SCORE[coinId].coin_id = coinId;
      constants.cache.COIN_SCORE[coinId].score = coin.repC;
      
      constants.cache.COIN_METRICS[coinId].coin_id = coinId;
      constants.cache.COIN_METRICS[coinId].price_usd = price_apt; // Store calculated price todo: implement apt to usd conversion
      
      
      constants.cache.COIN_METRICS[coinId].infinite_supply = false; // Set default value or derive from data
      


      if (coin.virtualTokenReserves) {
        try {
          const virtualTokenReservesBigInt = BigInt(coin.virtualTokenReserves);
          const circulating_supply = Number(virtualTokenReservesBigInt / BigInt(100000000));
          constants.cache.COIN_METRICS[coinId].circulating_supply = circulating_supply;
          constants.cache.COIN_METRICS[coinId].market_cap = price_apt * circulating_supply;
        } catch (e) {
          logger.error(`Error calculating market metrics for coin ${coinId}: ${(e as Error).message}`);
        }
      }
      
      constants.cache.COIN_LINKS[coinId].coin_id = coinId;
      if (coin.twitter) constants.cache.COIN_LINKS[coinId].twitter = coin.twitter;
      if (coin.telegram) constants.cache.COIN_LINKS[coinId].telegram = coin.telegram;
      if (coin.website) constants.cache.COIN_LINKS[coinId].website = coin.website;
    }
    
    const UptosCoinArray = Object.values(constants.cache.COINS).filter(coin => 
      coin.coin_id && coin.coin_id.includes('::')
    );
    const UptosCoinScoresArray = Object.values(constants.cache.COIN_SCORE).filter(score => 
      score.coin_id && score.coin_id.includes('::')
    );
    const UptosCoinLinksArray = Object.values(constants.cache.COIN_LINKS).filter(links => 
      links.coin_id && links.coin_id.includes('::')
    );
    const UptosCoinMetricsArray = Object.values(constants.cache.COIN_METRICS).filter(metrics => 
      metrics.coin_id && metrics.coin_id.includes('::')
    );
    
    if (UptosCoinArray.length > 0) {
      await methods.coins.addMultipleCoinsOrUpdate(UptosCoinArray);
      await Promise.all([
        methods.coinLinks.addMultipleCoinLinksOrUpdate(UptosCoinLinksArray),
        methods.coinScores.addMultipleCoinScoresOrUpdate(UptosCoinScoresArray),
        methods.coinMetrics.addMultipleCoinMetricsDataOrUpdate(UptosCoinMetricsArray),
      ]);
    }
    
    logger.info(`Finished inserting or updating ${UptosCoinArray.length} coins from Uptos Pump.`);
  } catch (error) {
    logger.error(`Error updating coin list data from Uptos Pump: ${(error as Error).message}`);
  }
};

export default { InsertOrUpdateDataFromCoinLists };