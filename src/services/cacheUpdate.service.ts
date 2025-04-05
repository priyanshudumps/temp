import methods from '../methods';
import constants from '../constants';
import { ICoin, ICoinLinks, ICoinScore, ICoinDexMetrics, ICoinMetrics, ICoinChat } from '../types';
import logger from '../config/logger';

const updateCachedCoinData = async (): Promise<void> => {
  const allCoins = await methods.coins.getAllCoins();
  for (const coin of allCoins) {
    constants.cache.COINS[coin.coin_id] = coin;
  }
};

const updateCachedCoinLinksData = async (): Promise<void> => {
  const allCoinLinks = await methods.coinLinks.getAllCoinLinks();
  for (const coinLink of allCoinLinks) {
    constants.cache.COIN_LINKS[coinLink.coin_id] = coinLink;
  }
};

const updateCachedCoinScoreData = async (): Promise<void> => {
  const allCoinScores = await methods.coinScores.getAllCoinScores([]);
  for (const coinScore of allCoinScores) {
    constants.cache.COIN_SCORE[coinScore.coin_id] = coinScore;
  }
};

const updateCachedCoinDexData = async (): Promise<void> => {
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

async function updateCachedCoinMetricsData(): Promise<void> {
  const allCoinMetrics = await methods.coinMetrics.getAllCoinMetricsData();
  for (const coinMetrics of allCoinMetrics) {
    constants.cache.COIN_METRICS[coinMetrics.coin_id] = coinMetrics;
  }
}

const updateCachedCoinChatsData = async (): Promise<void> => {

  constants.cache.COIN_CHATS = constants.cache.COIN_CHATS || {};
  
  logger.info("Coin chats are now managed via Redis cache, skipping database fetch");
};

export default {
  updateCachedCoinData,
  updateCachedCoinLinksData,
  updateCachedCoinScoreData,
  updateCachedCoinDexData,
  updateCachedCoinMetricsData,
  updateCachedCoinChatsData

};