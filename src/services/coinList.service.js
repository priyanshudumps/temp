const methods = require("../methods");
const CoinClients = require("./clients");
const constants = require("../constants");
const logger = require("../config/logger");

const InsertOrUpdateDataFromCoinLists = async () => {
  logger.info("Starting to insert or update coin data from hippo and panora.");
  const hippoCoinList = await CoinClients.hippoCoinClient();
  const panoraCoinList = await CoinClients.panoraCoinClient();

  for (const coin of hippoCoinList) {
    if (!constants.cache.COINS[coin.token_type.type]) {
      constants.cache.COINS[coin.token_type.type] = {};
    }
    if (!constants.cache.COIN_SCORE[coin.token_type.type]) {
      constants.cache.COIN_SCORE[coin.token_type.type] = {};
    }
    if (!constants.cache.COIN_LINKS[coin.token_type.type]) {
      constants.cache.COIN_LINKS[coin.token_type.type] = {};
    }

    constants.cache.COINS[coin.token_type.type].coin_id = coin.token_type.type;
    constants.cache.COINS[coin.token_type.type].coin_type_legacy =
      coin.token_type.type;
    constants.cache.COINS[coin.token_type.type].coin_name = coin.name;
    constants.cache.COINS[coin.token_type.type].coin_symbol = coin.symbol;
    constants.cache.COINS[coin.token_type.type].coin_defyapp_symbol =
      coin.hippo_symbol;
    constants.cache.COINS[coin.token_type.type].coin_decimals = coin.decimals;
    constants.cache.COINS[coin.token_type.type].coin_logo_url = coin.logo_url;
    constants.cache.COINS[coin.token_type.type].coingecko_id =
      coin.coingecko_id;

    constants.cache.COIN_SCORE[coin.token_type.type].coin_id =
      coin.token_type.type;
    constants.cache.COIN_SCORE[coin.token_type.type].is_permissioned_hippo =
      coin.permissioned_listing;

    constants.cache.COIN_LINKS[coin.token_type.type].coin_id =
      coin.token_type.type;
    constants.cache.COIN_LINKS[coin.token_type.type].website = coin.project_url;
  }

  for (const coin of panoraCoinList) {
    if (!constants.cache.COINS[coin.tokenAddress]) {
      constants.cache.COINS[coin.tokenAddress] = {};
    }
    if (!constants.cache.COIN_SCORE[coin.tokenAddress]) {
      constants.cache.COIN_SCORE[coin.tokenAddress] = {};
    }
    if (!constants.cache.COIN_LINKS[coin.tokenAddress]) {
      constants.cache.COIN_LINKS[coin.tokenAddress] = {};
    }

    const coin_type_legacy = coin.tokenAddress.includes("::")
      ? coin.tokenAddress
      : constants.cache.COINS[coin.tokenAddress]
      ? constants.cache.COINS[coin.tokenAddress].coin_type_legacy
        ? constants.cache.COINS[coin.tokenAddress].coin_type_legacy
        : null
      : null;
    const coin_address_fungible = coin.tokenAddress.includes("::")
      ? null
      : constants.cache.COINS[coin.tokenAddress]
      ? constants.cache.COINS[coin.tokenAddress].coin_address_fungible
        ? constants.cache.COINS[coin.tokenAddress].coin_address_fungible
        : null
      : null;

    constants.cache.COINS[coin.tokenAddress].coin_id = coin.tokenAddress;
    constants.cache.COINS[coin.tokenAddress].coin_type_legacy =
      coin_type_legacy;
    constants.cache.COINS[coin.tokenAddress].coin_address_fungible =
      coin_address_fungible;
    constants.cache.COINS[coin.tokenAddress].coin_name = coin.name;
    constants.cache.COINS[coin.tokenAddress].coin_symbol = coin.symbol;
    constants.cache.COINS[coin.tokenAddress].coin_defyapp_symbol =
      coin.panoraSymbol;
    constants.cache.COINS[coin.tokenAddress].coin_decimals = coin.decimals;
    constants.cache.COINS[coin.tokenAddress].coin_logo_url = coin.logoUrl;
    constants.cache.COINS[coin.tokenAddress].coingecko_id = coin.coingeckoId;
    constants.cache.COINS[coin.tokenAddress].coinmarketcap_id =
      coin.coinMarketCapId;

    constants.cache.COIN_SCORE[coin.tokenAddress].coin_id = coin.tokenAddress;
    constants.cache.COIN_SCORE[coin.tokenAddress].is_banned_panora =
      coin.isBanned;

    constants.cache.COIN_LINKS[coin.tokenAddress].coin_id = coin.tokenAddress;
    constants.cache.COIN_LINKS[coin.tokenAddress].website = coin.websiteUrl;
    // constants.cache.COIN_LINKS[coin.tokenAddress].tags = [coin.bridge, coin.category];
  }

  const CoinsArray = Object.values(constants.cache.COINS);
  const CoinScoresArray = Object.values(constants.cache.COIN_SCORE);
  const CoinLinksArray = Object.values(constants.cache.COIN_LINKS);

  // this is outside promise.all because we need to wait
  // for coins to be inserted first so that we do not violate foreign key constraints
  // if any new coin is added
  await methods.coins.addMultipleCoinsOrUpdate(CoinsArray),
    await Promise.all([
      methods.coinLinks.addMultipleCoinLinksOrUpdate(CoinLinksArray),
      methods.coinScores.addMultipleCoinScoresOrUpdate(CoinScoresArray),
    ]);
  logger.info(
    "Finished inserting or updating coin data from hippo and panora."
  );
};

module.exports = {
  InsertOrUpdateDataFromCoinLists,
};
