const { executeQuery } = require("../utils/queryExecutor");

/*
ddl
CREATE TABLE IF NOT EXISTS coin_metrics (
        coin_id VARCHAR(255) PRIMARY KEY REFERENCES coins(coin_id),
        circulating_supply NUMERIC NULL,
        total_supply NUMERIC NULL,
        max_supply NUMERIC NULL,
        holders NUMERIC NULL,
        infinite_supply BOOLEAN NULL,
        self_reported_market_cap NUMERIC NULL,
        self_reported_circulating_supply NUMERIC NULL,
        price_usd NUMERIC NULL,
        price_change_5m NUMERIC NULL,
        price_change_1hr NUMERIC NULL,
        price_change_6hr NUMERIC NULL,
        price_change_24h NUMERIC NULL,
        price_change_7d NUMERIC NULL,
        price_change_30d NUMERIC NULL,
        volume_24hr NUMERIC NULL,
        volume_7d NUMERIC NULL,
        volume_30d NUMERIC NULL,
        volume_change_24hr NUMERIC NULL,
        market_cap NUMERIC NULL,
        fully_diluted_market_cap NUMERIC NULL,
        merket_cap_by_total_supply NUMERIC NULL,
        tvl NUMERIC NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)
*/

const addMultipleCoinMetricsDataOrUpdate = async (coinMetricsData) => {
  const query = `
        INSERT INTO coin_metrics (coin_id, circulating_supply, total_supply, max_supply, holders, infinite_supply, self_reported_market_cap, self_reported_circulating_supply, price_usd, price_change_5m, price_change_1hr, price_change_6hr, price_change_24h, price_change_7d, price_change_30d, volume_24hr, volume_7d, volume_30d, volume_change_24hr, market_cap, fully_diluted_market_cap, merket_cap_by_total_supply, tvl)
        VALUES ${coinMetricsData
          .map(
            (_, index) =>
              `($${index * 23 + 1}, $${index * 23 + 2}, $${index * 23 + 3}, $${
                index * 23 + 4
              }, $${index * 23 + 5}, $${index * 23 + 6}, $${index * 23 + 7}, $${
                index * 23 + 8
              }, $${index * 23 + 9}, $${index * 23 + 10}, $${
                index * 23 + 11
              }, $${index * 23 + 12}, $${index * 23 + 13}, $${
                index * 23 + 14
              }, $${index * 23 + 15}, $${index * 23 + 16}, $${
                index * 23 + 17
              }, $${index * 23 + 18}, $${index * 23 + 19}, $${
                index * 23 + 20
              }, $${index * 23 + 21}, $${index * 23 + 22}, $${index * 23 + 23})`
          )
          .join(", ")}
        ON CONFLICT (coin_id)
        DO UPDATE
        SET circulating_supply = EXCLUDED.circulating_supply,
            total_supply = EXCLUDED.total_supply,
            max_supply = EXCLUDED.max_supply,
            holders = EXCLUDED.holders,
            infinite_supply = EXCLUDED.infinite_supply,
            self_reported_market_cap = EXCLUDED.self_reported_market_cap,
            self_reported_circulating_supply = EXCLUDED.self_reported_circulating_supply,
            price_usd = EXCLUDED.price_usd, 
            price_change_5m = EXCLUDED.price_change_5m,
            price_change_1hr = EXCLUDED.price_change_1hr,
            price_change_6hr = EXCLUDED.price_change_6hr,
            price_change_24h = EXCLUDED.price_change_24h,
            price_change_7d = EXCLUDED.price_change_7d,
            price_change_30d = EXCLUDED.price_change_30d,
            volume_24hr = EXCLUDED.volume_24hr,
            volume_7d = EXCLUDED.volume_7d,
            volume_30d = EXCLUDED.volume_30d,
            volume_change_24hr = EXCLUDED.volume_change_24hr,
            market_cap = EXCLUDED.market_cap,
            fully_diluted_market_cap = EXCLUDED.fully_diluted_market_cap,
            merket_cap_by_total_supply = EXCLUDED.merket_cap_by_total_supply,
            tvl = EXCLUDED.tvl,
            updated_at = NOW()
        RETURNING *;
    `;
  const values = coinMetricsData.reduce((acc, coinMetrics) => {
    acc.push(coinMetrics.coin_id);
    acc.push(coinMetrics.circulating_supply);
    acc.push(coinMetrics.total_supply);
    acc.push(coinMetrics.max_supply);
    acc.push(coinMetrics.holders);
    acc.push(coinMetrics.infinite_supply);
    acc.push(coinMetrics.self_reported_market_cap);
    acc.push(coinMetrics.self_reported_circulating_supply);
    acc.push(coinMetrics.price_usd);
    acc.push(coinMetrics.price_change_5m);
    acc.push(coinMetrics.price_change_1hr);
    acc.push(coinMetrics.price_change_6hr);
    acc.push(coinMetrics.price_change_24h);
    acc.push(coinMetrics.price_change_7d);
    acc.push(coinMetrics.price_change_30d);
    acc.push(coinMetrics.volume_24hr);
    acc.push(coinMetrics.volume_7d);
    acc.push(coinMetrics.volume_30d);
    acc.push(coinMetrics.volume_change_24hr);
    acc.push(coinMetrics.market_cap);
    acc.push(coinMetrics.fully_diluted_market_cap);
    acc.push(coinMetrics.merket_cap_by_total_supply);
    acc.push(coinMetrics.tvl);
    return acc;
  }, []);

  return executeQuery(query, values);
};

const getAllCoinMetricsData = async () => {
  const query = `
        SELECT * FROM coin_metrics;
    `;
  return executeQuery(query);
};

module.exports = {
  addMultipleCoinMetricsDataOrUpdate,
  getAllCoinMetricsData,
};
