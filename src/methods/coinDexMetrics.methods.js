const { executeQuery } = require("../utils/queryExecutor");

const addCoinMultipleDexMetricsOrUpdate = async (coinDexMetricsData) => {
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
          coin_id = excluded.coin_id,
          dex = excluded.dex,
          base_token = excluded.base_token,
          quote_token = excluded.quote_token,
          pair_created_at = excluded.pair_created_at,
          transactions_m5_buys = excluded.transactions_m5_buys,
          transactions_m5_sells = excluded.transactions_m5_sells,
          transactions_h1_buys = excluded.transactions_h1_buys,
          transactions_h1_sells = excluded.transactions_h1_sells,
          transactions_h6_buys = excluded.transactions_h6_buys,
          transactions_h6_sells = excluded.transactions_h6_sells,
          transactions_h24_buys = excluded.transactions_h24_buys,
          transactions_h24_sells = excluded.transactions_h24_sells,
          volume_usd_24h = excluded.volume_usd_24h,
          volume_usd_6h = excluded.volume_usd_6h,
          volume_usd_1h = excluded.volume_usd_1h,
          volume_usd_5m = excluded.volume_usd_5m,
          price_change_usd_24h = excluded.price_change_usd_24h,
          price_change_usd_6h = excluded.price_change_usd_6h,
          price_change_usd_1h = excluded.price_change_usd_1h,
          price_change_usd_5m = excluded.price_change_usd_5m,
          liquidity_usd = excluded.liquidity_usd,
          liquidity_base = excluded.liquidity_base,
          liquidity_quote = excluded.liquidity_quote,
          fdv_usd = excluded.fdv_usd,
          updated_at = NOW()
        RETURNING *;
      `;
  const values = coinDexMetricsData.reduce((acc, coinDexMetrics) => {
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
  return executeQuery(query, values, true);
};

const getAllCoinDexMetrics = async () => {
  const query = `SELECT * FROM coin_dex_metrics;`;
  return executeQuery(query, [], false);
};

module.exports = {
  addCoinMultipleDexMetricsOrUpdate,
  getAllCoinDexMetrics,
};
