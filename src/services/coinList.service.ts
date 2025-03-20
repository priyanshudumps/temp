import methods from '../methods';
import CoinClients from './clients';
import constants from '../constants';
import logger from '../config/logger';
import { ICoin, ICoinLinks, ICoinScore } from '../types';

const InsertOrUpdateDataFromCoinLists = async (): Promise<void> => {
  logger.info("Starting to gather API data for all tokens in Panora coin list");
  
  try {
    const panoraCoinList = await CoinClients.panoraCoinClient();

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
    logger.error(`Error updating coin list data: ${(error as Error).message}`);
  }
};

export default { InsertOrUpdateDataFromCoinLists };