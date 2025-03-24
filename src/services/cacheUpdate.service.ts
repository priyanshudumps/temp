import methods from '../methods';
import constants from '../constants';
import { ICoin, ICoinLinks, ICoinScore, ICoinDexMetrics, ICoinMetrics, ICoinChat } from '../types';

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
  // For chats, we need to organize by coin_id
  const allCoinChats = await methods.coinChats.getAllCoinChats();
  constants.cache.COIN_CHATS = {};
  
  for (const coinChat of allCoinChats) {
    if (!constants.cache.COIN_CHATS[coinChat.coin_id]) {
      constants.cache.COIN_CHATS[coinChat.coin_id] = [];
    }
    constants.cache.COIN_CHATS[coinChat.coin_id].push(coinChat);
  }
};

export default {
  updateCachedCoinData,
  updateCachedCoinLinksData,
  updateCachedCoinScoreData,
  updateCachedCoinDexData,
  updateCachedCoinMetricsData,
  updateCachedCoinChatsData

};