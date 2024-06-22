const methods = require("../methods");
const CoinClients = require("./clients");
const constants = require("../constants");
const logger = require("../config/logger");

const InsertOrUpdateCoinMetricsData = async (coinMetricsData) => {
  logger.info("Starting to insert or update coin metrics data.");

  const coinmarketcapIdToCoinIds = {};
  const coinIdToCoingeckoId = {};

  for (const coin of Object.values(constants.cache.COINS)) {
    if (coin.coinmarketcap_id) {
      coinmarketcapIdToCoinIds[coin.coinmarketcap_id] =
        coinmarketcapIdToCoinIds[coin.coinmarketcap_id] || [];
      coinmarketcapIdToCoinIds[coin.coinmarketcap_id].push(coin.coin_id);
    } else if (coin.coingecko_id) {
      coinIdToCoingeckoId[coin.coingecko_id] =
        coinIdToCoingeckoId[coin.coingecko_id] || [];
      coinIdToCoingeckoId[coin.coingecko_id].push(coin.coin_id);
    }
  }

  const coinmarketcapIds = Object.keys(coinmarketcapIdToCoinIds);
  const coingeckoIds = Object.keys(coinIdToCoingeckoId);

  const coinMarketcapIdSets = Array.from(
    { length: Math.ceil(coinmarketcapIds.length / 100) },
    (_, i) => coinmarketcapIds.slice(i * 100, (i + 1) * 100)
  );

  const coinGeckoIdSets = Array.from(
    { length: Math.ceil(coingeckoIds.length / 30) },
    (_, i) => coingeckoIds.slice(i * 30, (i + 1) * 30)
  );

  for (const coinMarketcapIdSet of coinMarketcapIdSets) {
    const coinMarketCapData =
      await CoinClients.coinMarketcapClient.getLatestQuoteByIds(
        coinMarketcapIdSet
      );
    if (coinMarketCapData.status.error_code) {
      logger.error(
        `Error fetching coin metrics data from coinmarketcap: ${coinMarketCapData.status.error_message}`
      );
      return;
    }

    for (const key of Object.keys(coinMarketCapData.data)) {
      for (const coinId of coinmarketcapIdToCoinIds[key]) {
        const cmcdata = coinMarketCapData.data[key];
        if (!constants.cache.COIN_METRICS[coinId]) {
          constants.cache.COIN_METRICS[coinId] = {};
        }
        constants.cache.COIN_METRICS[coinId].coin_id = coinId;
        constants.cache.COIN_METRICS[coinId].circulating_supply =
          cmcdata.circulating_supply;
        constants.cache.COIN_METRICS[coinId].total_supply =
          cmcdata.total_supply;
        constants.cache.COIN_METRICS[coinId].max_supply = cmcdata.max_supply;
        constants.cache.COIN_METRICS[coinId].holders = null;
        constants.cache.COIN_METRICS[coinId].infinite_supply =
          cmcdata.infinite_supply;
        constants.cache.COIN_METRICS[coinId].self_reported_market_cap =
          cmcdata.self_reported_market_cap;
        constants.cache.COIN_METRICS[coinId].self_reported_circulating_supply =
          cmcdata.self_reported_circulating_supply;
        constants.cache.COIN_METRICS[coinId].price_usd =
          cmcdata.quote.USD.price;
        constants.cache.COIN_METRICS[coinId].price_change_1h =
          cmcdata.quote.USD.percent_change_1h;
        constants.cache.COIN_METRICS[coinId].price_change_24h =
          cmcdata.quote.USD.percent_change_24h;
        constants.cache.COIN_METRICS[coinId].price_change_7d =
          cmcdata.quote.USD.percent_change_7d;
        constants.cache.COIN_METRICS[coinId].price_change_30d =
          cmcdata.quote.USD.percent_change_30d;
        constants.cache.COIN_METRICS[coinId].volume_24h =
          cmcdata.quote.USD.volume_24h;
        constants.cache.COIN_METRICS[coinId].volume_7d =
          cmcdata.quote.USD.volume_7d;
        constants.cache.COIN_METRICS[coinId].volume_30d =
          cmcdata.quote.USD.volume_30d;
        constants.cache.COIN_METRICS[coinId].colume_change_24h =
          cmcdata.quote.USD.volume_change_24h;
        constants.cache.COIN_METRICS[coinId].market_cap =
          cmcdata.quote.USD.market_cap;
        constants.cache.COIN_METRICS[coinId].fully_diluted_market_cap =
          cmcdata.quote.USD.fully_diluted_market_cap;
        constants.cache.COIN_METRICS[coinId].market_cap_by_total_supply =
          cmcdata.quote.USD.market_cap_by_total_supply;
        constants.cache.COIN_METRICS[coinId].tvl = cmcdata.quote.USD.tvl;
      }
    }
  }

  for (const coinGeckoIdSet of coinGeckoIdSets) {
    const coinGeckoData = await CoinClients.coinGeckoClient.getPriceByIds(
      coinGeckoIdSet
    );
    for (const keys of Object.keys(coinGeckoData)) {
      for (const coinId of coinIdToCoingeckoId[keys]) {
        const cgdata = coinGeckoData[keys];
        if (!constants.cache.COIN_METRICS[coinId]) {
          constants.cache.COIN_METRICS[coinId] = {};
        }
        constants.cache.COIN_METRICS[coinId].coin_id = coinId;
        constants.cache.COIN_METRICS[coinId].price_usd = cgdata.usd;
        constants.cache.COIN_METRICS[coinId].market_cap = cgdata.usd_market_cap;
        constants.cache.COIN_METRICS[coinId].volume_24hr = cgdata.usd_24h_vol;
        constants.cache.COIN_METRICS[coinId].volume_change_24hr =
          cgdata.usd_24h_change;
      }
    }
  }

  await methods.coinMetrics.addMultipleCoinMetricsDataOrUpdate(
    Object.values(constants.cache.COIN_METRICS)
  );

  logger.info("Finished inserting or updating coin metrics data.");
};

module.exports = {
  InsertOrUpdateCoinMetricsData,
};
