const methods = require("../methods");
const CoinClients = require("./clients");
const constants = require("../constants");
const logger = require("../config/logger");

const InsertOrUpdateDataFromCoinLists = async () => {
  logger.info("Starting to fetch coin data from hippo and panora.");
  const hippoCoinList = await CoinClients.hippoCoinClient();
  const panoraCoinList = await CoinClients.panoraCoinClient();

  for (const coin of hippoCoinList) {
    const coinData = {
      coin_id: coin.token_type.type,
      coin_type_legacy: coin.token_type.type,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
      coin_defyapp_symbol: coin.hippo_symbol,
      coin_decimals: coin.decimals,
      coin_logo_url: coin.logo_url,
      coingecko_id: coin.coingecko_id,
    };

    if (!constants.cache.COIN_SCORE[coinData.coin_id]) {
      constants.cache.COIN_SCORE[coinData.coin_id] = {
        coin_id: coinData.coin_id,
        is_permissioned_hippo: coin.permissioned_listing,
      };
    } else{
      constants.cache.COIN_SCORE[coinData.coin_id].is_permissioned_hippo = coin.permissioned_listing;
    }

    if (!constants.cache.COIN_LINKS[coinData.coin_id]) {
      constants.cache.COIN_LINKS[coinData.coin_id] = {
        coin_id: coinData.coin_id,
        website: coin.project_url,
        // tags: [...coin.extensions.data, coin.source], // TODO: work on tags 
      };
    } else{
      constants.cache.COIN_LINKS[coinData.coin_id].website = coin.project_url;
      // constants.cache.COIN_LINKS[coinData.coin_id].tags = [...coin.extensions.data];
    }

    constants.cache.COINS[coinData.coin_id] = coinData;
  }

  for (const coin of panoraCoinList) {
    const coin_type_legacy = coin.tokenAddress.includes("::")
      ? coin.tokenAddress
      : constants.cache.COINS[coin.tokenAddress] ? constants.cache.COINS[coin.tokenAddress].coin_type_legacy
      ? constants.cache.COINS[coin.tokenAddress].coin_type_legacy
      : null: null;
    const coin_address_fungible = coin.tokenAddress.includes("::")
      ? null
      : constants.cache.COINS[coin.tokenAddress]? constants.cache.COINS[coin.tokenAddress].coin_address_fungible
      ? constants.cache.COINS[coin.tokenAddress].coin_address_fungible
      : null: null;

    const coinData = {
      coin_id: coin.tokenAddress,
      coin_type_legacy: coin_type_legacy,
      coin_address_fungible: coin_address_fungible,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
      coin_defyapp_symbol: coin.panoraSymbol,
      coin_decimals: coin.decimals,
      coin_logo_url: coin.logoUrl,
      coingecko_id: coin.coingeckoId,
      coinmarketcap_id: coin.coinMarketCapId,
    };

    if (!constants.cache.COIN_SCORE[coinData.coin_id]) {
      constants.cache.COIN_SCORE[coinData.coin_id] = {
        coin_id: coinData.coin_id,
        is_banned_panora: coin.isBanned,
      };
    } else{
      constants.cache.COIN_SCORE[coinData.coin_id].is_banned_panora = coin.isBanned;
    }

    if (!constants.cache.COIN_LINKS[coinData.coin_id]) {
      constants.cache.COIN_LINKS[coinData.coin_id] = {
        coin_id: coinData.coin_id,
        website: coin.websiteUrl,
        // tags: [coin.bridge, coin.category],
      };
    } else{
      constants.cache.COIN_LINKS[coinData.coin_id].website = coin.websiteUrl;
      // constants.cache.COIN_LINKS[coinData.coin_id].tags = [
      //   ...constants.cache.COIN_LINKS[coinData.coin_id].tags,
      //   coin.bridge,
      //   coin.category,
      // ];
    }
    
    constants.cache.COINS[coinData.coin_id] = coinData;
  }

  const CoinsArray = Object.values(constants.cache.COINS);
  const CoinScoresArray = Object.values(constants.cache.COIN_SCORE);
  const CoinLinksArray = Object.values(constants.cache.COIN_LINKS);

  await methods.coins.addMultipleCoinsOrUpdate(CoinsArray);
  await Promise.all([
    methods.coinLinks.addMultipleCoinLinksOrUpdate(CoinLinksArray),
    methods.coinScores.addMultipleCoinScoresOrUpdate(CoinScoresArray),
  ]);
  logger.info("Updated coin data from hippo and panora.");
};


module.exports = {
  InsertOrUpdateDataFromCoinLists,
};