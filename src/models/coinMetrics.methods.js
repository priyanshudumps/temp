import { executeQuery } from '../../utils/queryExecutor';

const addCoinMetricsIfNotExists = async (coinMetricsData) => {
    const query = `
        INSERT INTO coin_metrics (coin_id, circulating_supply, total_supply, max_supply, holders, price_usd, price_change_5m, price_change_1hr, price_change_6hr, price_change_24h, price_change_7d, price_change_30d, market_cap, fully_diluted_market_cap, usd_24h_vol)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (coin_id)
        DO NOTHING
        RETURNING *;
    `;
    return executeQuery(query, [
        coinMetricsData.coin_id,
        coinMetricsData.circulating_supply,
        coinMetricsData.total_supply,
        coinMetricsData.max_supply,
        coinMetricsData.holders,
        coinMetricsData.price_usd,
        coinMetricsData.price_change_5m,
        coinMetricsData.price_change_1hr,
        coinMetricsData.price_change_6hr,
        coinMetricsData.price_change_24h,
        coinMetricsData.price_change_7d,
        coinMetricsData.price_change_30d,
        coinMetricsData.market_cap,
        coinMetricsData.fully_diluted_market_cap,
        coinMetricsData.usd_24h_vol,
    ], true);
}

const updateCoinMetrics = async (coinId, coinMetricsData) => {
    const query = `
        UPDATE coin_metrics
        SET circulating_supply = $1,
            total_supply = $2,
            max_supply = $3,
            holders = $4,
            price_usd = $5,
            price_change_5m = $6,
            price_change_1hr = $7,
            price_change_6hr = $8,
            price_change_24h = $9,
            price_change_7d = $10,
            price_change_30d = $11,
            market_cap = $12,
            fully_diluted_market_cap = $13,
            usd_24h_vol = $14,
            updated_at = now()
        WHERE coin_id = $15
        RETURNING *;
    `;
    return executeQuery(query, [
        coinMetricsData.circulating_supply,
        coinMetricsData.total_supply,
        coinMetricsData.max_supply,
        coinMetricsData.holders,
        coinMetricsData.price_usd,
        coinMetricsData.price_change_5m,
        coinMetricsData.price_change_1hr,
        coinMetricsData.price_change_6hr,
        coinMetricsData.price_change_24h,
        coinMetricsData.price_change_7d,
        coinMetricsData.price_change_30d,
        coinMetricsData.market_cap,
        coinMetricsData.fully_diluted_market_cap,
        coinMetricsData.usd_24h_vol,
        coinId,
    ], true);
}

// get functions

const getCoinMetricsByCoinId = async (coinId) => {
    const query = `
        SELECT * FROM coin_metrics WHERE coin_id = $1;
    `;
    return executeQuery(query, [coinId]);
}

const getCoinMetrics = async () => {
    const query = `
        SELECT * FROM coin_metrics;
    `;
    return executeQuery(query);
}

export default{
    addCoinMetricsIfNotExists,
    updateCoinMetrics,
    getCoinMetricsByCoinId,
    getCoinMetrics,
}
