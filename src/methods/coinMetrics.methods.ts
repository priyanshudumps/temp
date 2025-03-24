import { executeQuery } from '../utils/queryExecutor';
import { ICoinMetrics } from '../types';

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
        raw_charts JSONB NULL, 
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)
*/

export const addMultipleCoinMetricsDataOrUpdate = async (coinMetricsData: ICoinMetrics[]): Promise<ICoinMetrics[]> => {
  const BATCH_SIZE = 100; 
  let results: ICoinMetrics[] = [];
  
  for (let i = 0; i < coinMetricsData.length; i += BATCH_SIZE) {
    const batch = coinMetricsData.slice(i, i + BATCH_SIZE);
    
    const valuePlaceholders = [];
    const values = [];
    let paramCounter = 1;
    
    for (const coinMetrics of batch) {
      const rowPlaceholder = [];
      for (let j = 0; j < 24; j++) { // 24 columns
        rowPlaceholder.push(`$${paramCounter}`);
        paramCounter++;
      }
      valuePlaceholders.push(`(${rowPlaceholder.join(', ')})`);
      
      values.push(
        coinMetrics.coin_id,
        coinMetrics.circulating_supply,
        coinMetrics.total_supply,
        coinMetrics.max_supply,
        coinMetrics.holders,
        coinMetrics.infinite_supply,
        coinMetrics.self_reported_market_cap,
        coinMetrics.self_reported_circulating_supply,
        coinMetrics.price_usd,
        coinMetrics.price_change_5m,
        coinMetrics.price_change_1hr,
        coinMetrics.price_change_6hr,
        coinMetrics.price_change_24h,
        coinMetrics.price_change_7d,
        coinMetrics.price_change_30d,
        coinMetrics.volume_24hr,
        coinMetrics.volume_7d,
        coinMetrics.volume_30d,
        coinMetrics.volume_change_24hr,
        coinMetrics.market_cap,
        coinMetrics.fully_diluted_market_cap,
        coinMetrics.merket_cap_by_total_supply,
        coinMetrics.tvl,
        coinMetrics.raw_charts ? JSON.stringify(coinMetrics.raw_charts) : null
      );
    }
    
    const query = `
      INSERT INTO coin_metrics (
        coin_id, circulating_supply, total_supply, max_supply, 
        holders, infinite_supply, self_reported_market_cap, 
        self_reported_circulating_supply, price_usd, price_change_5m, 
        price_change_1hr, price_change_6hr, price_change_24h, 
        price_change_7d, price_change_30d, volume_24hr, volume_7d, 
        volume_30d, volume_change_24hr, market_cap, 
        fully_diluted_market_cap, merket_cap_by_total_supply, 
        tvl, raw_charts
      )
      VALUES ${valuePlaceholders.join(', ')}
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
          raw_charts = EXCLUDED.raw_charts,
          updated_at = NOW()
      RETURNING *;
    `;
    
    const batchResults = await executeQuery<ICoinMetrics>(query, values);
    results = [...results, ...batchResults];
  }
  
  return results;
};

export const getAllCoinMetricsData = async (): Promise<ICoinMetrics[]> => {
  const query = `
        SELECT * FROM coin_metrics;
    `;
  return executeQuery<ICoinMetrics>(query);
};