import methods from '../methods';
import CoinClients from './clients';
import constants from '../constants';
import logger from '../config/logger';
import { ICoinMetrics } from '../types';

interface CoinGeckoData {
  [key: string]: {
    usd: number;
    usd_market_cap: number;
    usd_24h_vol: number;
    usd_24h_change: number;
  };
}

interface CoinMarketCapData {
  status: {
    error_code: number;
    error_message?: string;
  };
  data: {
    [key: string]: {
      circulating_supply: number;
      total_supply: number;
      max_supply: number;
      infinite_supply: boolean;
      self_reported_market_cap: number;
      self_reported_circulating_supply: number;
      quote: {
        USD: {
          price: number;
          percent_change_1h: number;
          percent_change_24h: number;
          percent_change_7d: number;
          percent_change_30d: number;
          volume_24h: number;
          volume_7d: number;
          volume_30d: number;
          volume_change_24h: number;
          market_cap: number;
          fully_diluted_market_cap: number;
          market_cap_by_total_supply: number;
          tvl: number;
        };
      };
    };
  };
}

// Interface for Uptos chart data
interface ChartDataPoint {
  date: string;
  low: number;
  high: number;
  open: number;
  close: number;
  buyC: number;
  sellC: number;
}

/**
 * Calculate price changes from chart data
 * @param chartData Array of chart data points
 */
const calculatePriceChanges = (chartData: ChartDataPoint[]) => {
  if (!chartData || chartData.length === 0) {
    return {
      price_change_5m: null,
      price_change_1hr: null,
      price_change_6hr: null,
      price_change_24h: null,
      price_change_7d: null,
      price_change_30d: null,
    };
  }

  // Sort chart data by date (most recent first)
  const sortedData = [...chartData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get most recent price
  const currentPrice = sortedData[0].close;
  
  // Find prices at different time intervals
  const now = new Date(sortedData[0].date).getTime();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;
  const sixHoursAgo = now - 6 * 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Find closest data points to each time interval
  const findClosestPrice = (targetTime: number) => {
    let closest = sortedData[0];
    let minDiff = Number.MAX_VALUE;

    for (const point of sortedData) {
      const time = new Date(point.date).getTime();
      const diff = Math.abs(time - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }
    return closest.close;
  };

  // Calculate percentage changes
  const calculatePercentChange = (oldPrice: number, newPrice: number) => {
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };

  const priceChanges = {
    price_change_5m: calculatePercentChange(findClosestPrice(fiveMinutesAgo), currentPrice),
    price_change_1hr: calculatePercentChange(findClosestPrice(oneHourAgo), currentPrice),
    price_change_6hr: calculatePercentChange(findClosestPrice(sixHoursAgo), currentPrice),
    price_change_24h: calculatePercentChange(findClosestPrice(oneDayAgo), currentPrice),
    price_change_7d: calculatePercentChange(findClosestPrice(sevenDaysAgo), currentPrice),
    price_change_30d: calculatePercentChange(findClosestPrice(thirtyDaysAgo), currentPrice),
  };

  return priceChanges;
};

/**
 * Calculate trading volume from chart data
 * @param chartData Array of chart data points
 */
const calculateVolume = (chartData: ChartDataPoint[]) => {
  if (!chartData || chartData.length === 0) {
    return {
      volume_24hr: null,
      volume_7d: null,
      volume_30d: null,
    };
  }

  // Sort chart data by date
  const sortedData = [...chartData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const now = new Date(sortedData[0].date).getTime();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // This is a very rough approximation using transaction counts
  const volume24h = sortedData
    .filter(point => new Date(point.date).getTime() >= oneDayAgo)
    .reduce((sum, point) => sum + point.buyC + point.sellC, 0);

  const volume7d = sortedData
    .filter(point => new Date(point.date).getTime() >= sevenDaysAgo)
    .reduce((sum, point) => sum + point.buyC + point.sellC, 0);

  const volume30d = sortedData
    .filter(point => new Date(point.date).getTime() >= thirtyDaysAgo)
    .reduce((sum, point) => sum + point.buyC + point.sellC, 0);

  return {
    volume_24hr: volume24h,
    volume_7d: volume7d,
    volume_30d: volume30d,
  };
};

/**
 * Sleep function to pause execution
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const InsertOrUpdateCoinMetricsData = async (): Promise<void> => {
  logger.info(
    "Starting to insert or update coin metrics data from Coinmarketcap and Coingecko."
  );

  const coinmarketcapIdToCoinIds: Record<string, string[]> = {};
  const coinIdToCoingeckoId: Record<string, string[]> = {};

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

  try {
    for (const coinMarketcapIdSet of coinMarketcapIdSets) {
      const coinMarketCapData: CoinMarketCapData =
        await CoinClients.coinMarketcapClient.getLatestQuoteByIds(
          coinMarketcapIdSet
        );
        console.log(coinMarketCapData)
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
            constants.cache.COIN_METRICS[coinId] = {} as ICoinMetrics;
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
          constants.cache.COIN_METRICS[coinId].price_change_1hr =
            cmcdata.quote.USD.percent_change_1h;
          constants.cache.COIN_METRICS[coinId].price_change_24h =
            cmcdata.quote.USD.percent_change_24h;
          constants.cache.COIN_METRICS[coinId].price_change_7d =
            cmcdata.quote.USD.percent_change_7d;
          constants.cache.COIN_METRICS[coinId].price_change_30d =
            cmcdata.quote.USD.percent_change_30d;
          constants.cache.COIN_METRICS[coinId].volume_24hr =
            cmcdata.quote.USD.volume_24h;
          constants.cache.COIN_METRICS[coinId].volume_7d =
            cmcdata.quote.USD.volume_7d;
          constants.cache.COIN_METRICS[coinId].volume_30d =
            cmcdata.quote.USD.volume_30d;
          constants.cache.COIN_METRICS[coinId].volume_change_24hr =
            cmcdata.quote.USD.volume_change_24h;
          constants.cache.COIN_METRICS[coinId].market_cap =
            cmcdata.quote.USD.market_cap;
          constants.cache.COIN_METRICS[coinId].fully_diluted_market_cap =
            cmcdata.quote.USD.fully_diluted_market_cap;
          constants.cache.COIN_METRICS[coinId].merket_cap_by_total_supply =
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
            constants.cache.COIN_METRICS[coinId] = {} as ICoinMetrics;
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

    // // Process Uptos Pump data for coins with addresses containing '::'
    // const uptosCoinIds = Object.keys(constants.cache.COINS).filter(id => id.includes('::'));
    // logger.info(`Processing metrics for ${uptosCoinIds.length} Uptos coins with rate limiting`);

    // // Process in smaller batches with delay to avoid rate limiting
    // const BATCH_SIZE = 500;
    // const DELAY_BETWEEN_BATCHES = 0; // 5 seconds between batches
    // const DELAY_BETWEEN_REQUESTS = 0; // 1 second between individual requests

    // // Split into batches
    // const batchedUptosCoinIds = [];
    // for (let i = 0; i < uptosCoinIds.length; i += BATCH_SIZE) {
    //   batchedUptosCoinIds.push(uptosCoinIds.slice(i, i + BATCH_SIZE));
    // }

    // // Process each batch
    // // todo: implement db insertions for each batch 

    // for (let batchIndex = 0; batchIndex < batchedUptosCoinIds.length; batchIndex++) {
    //   const batch = batchedUptosCoinIds[batchIndex];
    //   logger.info(`Processing batch ${batchIndex + 1}/${batchedUptosCoinIds.length} (${batch.length} coins)`);
      
   
    //   for (const coinId of batch) {
    //     try {
    //       logger.info(`Fetching chart data for ${coinId}`);
    //       const chartData = []//await CoinClients.uptosPumpChartsClient.getTokenChartData(coinId);
          
    //       await sleep(DELAY_BETWEEN_REQUESTS);
          
    //       // Fetch holders data for the coin
    //       logger.info(`Fetching holders data for ${coinId}`);
    //       const holdersData = []//await CoinClients.uptosPumpHoldersClient.getTokenHolders(coinId);
          
    //       if (!constants.cache.COIN_METRICS[coinId]) {
    //         constants.cache.COIN_METRICS[coinId] = {} as ICoinMetrics;
    //       }
          
    //       constants.cache.COIN_METRICS[coinId].coin_id = coinId;
          
    //       // Save the raw chart data
    //       constants.cache.COIN_METRICS[coinId].raw_charts = null;
          
    //       if (holdersData && Array.isArray(holdersData)) {
    //         constants.cache.COIN_METRICS[coinId].holders = null;
    //       }
          
    //       if (chartData && chartData.length > 0) {
    //         const sortedChartData = [...chartData].sort((a, b) => 
    //           new Date(b.date).getTime() - new Date(a.date).getTime()
    //         );
            
    //         constants.cache.COIN_METRICS[coinId].price_usd = sortedChartData[0].close;
            
    //         const priceChanges = calculatePriceChanges(chartData);
    //         constants.cache.COIN_METRICS[coinId].price_change_5m = priceChanges.price_change_5m;
    //         constants.cache.COIN_METRICS[coinId].price_change_1hr = priceChanges.price_change_1hr;
    //         constants.cache.COIN_METRICS[coinId].price_change_6hr = priceChanges.price_change_6hr;
    //         constants.cache.COIN_METRICS[coinId].price_change_24h = priceChanges.price_change_24h;
    //         constants.cache.COIN_METRICS[coinId].price_change_7d = priceChanges.price_change_7d;
    //         constants.cache.COIN_METRICS[coinId].price_change_30d = priceChanges.price_change_30d;
            
    //         const volumeData = calculateVolume(chartData);
    //         constants.cache.COIN_METRICS[coinId].volume_24hr = volumeData.volume_24hr;
    //         constants.cache.COIN_METRICS[coinId].volume_7d = volumeData.volume_7d;
    //         constants.cache.COIN_METRICS[coinId].volume_30d = volumeData.volume_30d;
    //       }
          
    //       logger.info(`Successfully processed metrics for Uptos coin: ${coinId}`);
    //     } catch (error) {
    //       logger.error(`Error processing Uptos metrics for coin ${coinId}: ${(error as Error).message}`);
    //     }
        
    //     await sleep(DELAY_BETWEEN_REQUESTS);
    //   }
      
    //   if (batchIndex < batchedUptosCoinIds.length - 1) {
    //     logger.info(`Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before processing next batch...`);
    //     await sleep(DELAY_BETWEEN_BATCHES);
    //   }
    // }

    // Update the database with all coin metrics
    await methods.coinMetrics.addMultipleCoinMetricsDataOrUpdate(
      Object.values(constants.cache.COIN_METRICS)
    );

    logger.info(
      "Finished inserting or updating coin metrics data from all sources."
    );
  } catch (error) {
    logger.error(`Error updating coin metrics: ${(error as Error).message}`);
  }
};

export default { InsertOrUpdateCoinMetricsData };