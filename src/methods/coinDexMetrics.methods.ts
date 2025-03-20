import { executeQuery } from "../utils/queryExecutor";
import { ICoinDexMetrics } from "../types/coin.types";

export const addCoinMultipleDexMetricsOrUpdate = async (coinDexMetricsData: ICoinDexMetrics[]): Promise<ICoinDexMetrics[]> => {
  const query = `
        INSERT INTO coin_dex_metrics (coin_id, pair_id, dex, base_token, quote_token, pair_created_at, transactions_m5_buys, transactions_m5_sells, transactions_h1_buys, transactions_h1_sells, transactions_h6_buys, transactions_h6_sells, transactions_h24_buys, transactions_h24_sells, volume_usd_24h, volume_usd_6h, volume_usd_1h, volume_usd_5m, price_change_usd_24h, price_change_usd_6h, price_change_usd_1h, price_change_usd_5m, liquidity_usd, liquidity_base, liquidity_quote, fdv_usd)
        VALUES ${coinDexMetricsData
          .map(
            (_, index) =>
              `($${index * 26 + 1}, $${index * 26 + 2}, $${index * 26 + 3}, $${
                index * 26 + 4
              }, $${index * 26 + 5}, $${index * 26 + 6}, $${index * 26 + 7}, $${
                index * 26 + 8
              }, $${index * 26 + 9}, $${index * 26 + 10}, $${
                index * 26 + 11
              }, $${index * 26 + 12}, $${index * 26 + 13}, $${
                index * 26 + 14
              }, $${index * 26 + 15}, $${index * 26 + 16}, $${
                index * 26 + 17
              }, $${index * 26 + 18}, $${index * 26 + 19}, $${
                index * 26 + 20
              }, $${index * 26 + 21}, $${index * 26 + 22}, $${
                index * 26 + 23
              }, $${index * 26 + 24}, $${index * 26 + 25}, $${index * 26 + 26})`
          )
          .join(", ")} ON CONFLICT (pair_id)
        DO UPDATE SET
          coin_id = EXCLUDED.coin_id,
          dex = EXCLUDED.dex,
          base_token = EXCLUDED.base_token,
          quote_token = EXCLUDED.quote_token,
          pair_created_at = EXCLUDED.pair_created_at,
          transactions_m5_buys = EXCLUDED.transactions_m5_buys,
          transactions_m5_sells = EXCLUDED.transactions_m5_sells,
          transactions_h1_buys = EXCLUDED.transactions_h1_buys,
          transactions_h1_sells = EXCLUDED.transactions_h1_sells,
          transactions_h6_buys = EXCLUDED.transactions_h6_buys,
          transactions_h6_sells = EXCLUDED.transactions_h6_sells,
          transactions_h24_buys = EXCLUDED.transactions_h24_buys,
          transactions_h24_sells = EXCLUDED.transactions_h24_sells,
          volume_usd_24h = EXCLUDED.volume_usd_24h,
          volume_usd_6h = EXCLUDED.volume_usd_6h,
          volume_usd_1h = EXCLUDED.volume_usd_1h,
          volume_usd_5m = EXCLUDED.volume_usd_5m,
          price_change_usd_24h = EXCLUDED.price_change_usd_24h,
          price_change_usd_6h = EXCLUDED.price_change_usd_6h,
          price_change_usd_1h = EXCLUDED.price_change_usd_1h,
          price_change_usd_5m = EXCLUDED.price_change_usd_5m,
          liquidity_usd = EXCLUDED.liquidity_usd,
          liquidity_base = EXCLUDED.liquidity_base,
          liquidity_quote = EXCLUDED.liquidity_quote,
          fdv_usd = EXCLUDED.fdv_usd,
          updated_at = NOW()
        RETURNING *;
      `;
  const values = coinDexMetricsData.reduce<any[]>((acc, coinDexMetrics) => {
    acc.push(coinDexMetrics.coin_id);
    acc.push(coinDexMetrics.pair_id);
    acc.push(coinDexMetrics.dex);
    acc.push(coinDexMetrics.base_token);
    acc.push(coinDexMetrics.quote_token);
    acc.push(coinDexMetrics.pair_created_at);
    acc.push(coinDexMetrics.transactions_m5_buys);
    acc.push(coinDexMetrics.transactions_m5_sells);
    acc.push(coinDexMetrics.transactions_h1_buys);
    acc.push(coinDexMetrics.transactions_h1_sells);
    acc.push(coinDexMetrics.transactions_h6_buys);
    acc.push(coinDexMetrics.transactions_h6_sells);
    acc.push(coinDexMetrics.transactions_h24_buys);
    acc.push(coinDexMetrics.transactions_h24_sells);
    acc.push(coinDexMetrics.volume_usd_24h);
    acc.push(coinDexMetrics.volume_usd_6h);
    acc.push(coinDexMetrics.volume_usd_1h);
    acc.push(coinDexMetrics.volume_usd_5m);
    acc.push(coinDexMetrics.price_change_usd_24h);
    acc.push(coinDexMetrics.price_change_usd_6h);
    acc.push(coinDexMetrics.price_change_usd_1h);
    acc.push(coinDexMetrics.price_change_usd_5m);
    acc.push(coinDexMetrics.liquidity_usd);
    acc.push(coinDexMetrics.liquidity_base);
    acc.push(coinDexMetrics.liquidity_quote);
    acc.push(coinDexMetrics.fdv_usd);
    return acc;
  }, []);
  return executeQuery<ICoinDexMetrics>(query, values, true);
};

export const getAllCoinDexMetrics = async (): Promise<ICoinDexMetrics[]> => {
  const query = `SELECT * FROM coin_dex_metrics;`;
  return executeQuery<ICoinDexMetrics>(query, [], false);
};

export default {
  addCoinMultipleDexMetricsOrUpdate,
  getAllCoinDexMetrics,
};