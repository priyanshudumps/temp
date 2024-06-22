const methods = require("../methods");
const constants = require("../constants");

const updateCachedCoinData = async () => {
  const allCoins = await methods.coins.getAllCoins();
  for (const coin of allCoins) {
    constants.cache.COINS[coin.coin_id] = coin;
  }
};

const updateCachedCoinLinksData = async () => {
  const allCoinLinks = await methods.coinLinks.getAllCoinLinks();
  for (const coinLink of allCoinLinks) {
    constants.cache.COIN_LINKS[coinLink.coin_id] = coinLink;
  }
};

const updateCachedCoinScoreData = async () => {
  const allCoinScores = await methods.coinScores.getAllCoinScores();
  for (const coinScore of allCoinScores) {
    constants.cache.COIN_SCORE[coinScore.coin_id] = coinScore;
  }
};

const updateCachedCoinDexData = async () => {
  const allCoinDexMetrics = await methods.coinDexMetrics.getAllCoinDexMetrics();
  constants.cache.COIN_DEX_METRICS = {};
  for (const coinDexMetrics of allCoinDexMetrics) {
    if (!constants.cache.COIN_DEX_METRICS[coinDexMetrics.coin_id]) {
      constants.cache.COIN_DEX_METRICS[coinDexMetrics.coin_id] = [];
    }
    constants.cache.COIN_DEX_METRICS[coinDexMetrics.coin_id].push(
      coinDexMetrics
    );
  }
};

module.exports = {
  updateCachedCoinData,
  updateCachedCoinLinksData,
  updateCachedCoinScoreData,
  updateCachedCoinDexData,
};
