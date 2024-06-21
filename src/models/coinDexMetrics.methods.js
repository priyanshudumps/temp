import { executeQuery } from '../../utils/queryExecutor';

const addCoinDexMetricsIfNotExists = async (coinDexMetricsData) => {
    const query = `
        INSERT INTO coin_dex_metrics (coin_id, pair_id, dex, base_token, quote_token, liquidity, fdv, pair_created_at, transactions, transactions_m5_buys, transactions_m5_sells, transactions_h1_buys, transactions_h1_sells, transactions_h6_buys, transactions_h6_sells, transactions_h24_buys, transactions_h24_sells, volume_usd_24h, volume_usd_6h, volume_usd_1h, volume_usd_5m, price_change_usd_24h, price_change_usd_6h, price_change_usd_1h, price_change_usd_5m, liquidity_usd, liquidity_base, liquidity_quote, fdv_usd)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        ON CONFLICT (pair_id)
        DO NOTHING
        RETURNING *;
    `;
    return executeQuery(query, [
        coinDexMetricsData.coin_id,
        coinDexMetricsData.pair_id,
        coinDexMetricsData.dex,
        coinDexMetricsData.base_token,
        coinDexMetricsData.quote_token,
        coinDexMetricsData.liquidity,
        coinDexMetricsData.fdv,
        coinDexMetricsData.pair_created_at,
        coinDexMetricsData.transactions,
        coinDexMetricsData.transactions_m5_buys,
        coinDexMetricsData.transactions_m5_sells,
        coinDexMetricsData.transactions_h1_buys,
        coinDexMetricsData.transactions_h1_sells,
        coinDexMetricsData.transactions_h6_buys,
        coinDexMetricsData.transactions_h6_sells,
        coinDexMetricsData.transactions_h24_buys,
        coinDexMetricsData.transactions_h24_sells,
        coinDexMetricsData.volume_usd_24h,
        coinDexMetricsData.volume_usd_6h,
        coinDexMetricsData.volume_usd_1h,
        coinDexMetricsData.volume_usd_5m,
        coinDexMetricsData.price_change_usd_24h,
        coinDexMetricsData.price_change_usd_6h,
        coinDexMetricsData.price_change_usd_1h,
        coinDexMetricsData.price_change_usd_5m,
        coinDexMetricsData.liquidity_usd,
        coinDexMetricsData.liquidity_base,
        coinDexMetricsData.liquidity_quote,
        coinDexMetricsData.fdv_usd,
    ], true);
}

const updateCoinDexMetrics = async (pairId, coinDexMetricsData) => {
    const query = `
        UPDATE coin_dex_metrics
        SET coin_id = $1,
            dex = $2,
            base_token = $3,
            quote_token = $4,
            liquidity = $5,
            fdv = $6,
            pair_created_at = $7,
            transactions = $8,
            transactions_m5_buys = $9,
            transactions_m5_sells = $10,
            transactions_h1_buys = $11,
            transactions_h1_sells = $12,
            transactions_h6_buys = $13,
            transactions_h6_sells = $14,
            transactions_h24_buys = $15,
            transactions_h24_sells = $16,
            volume_usd_24h = $17,
            volume_usd_6h = $18,
            volume_usd_1h = $19,
            volume_usd_5m = $20,
            price_change_usd_24h = $21,
            price_change_usd_6h = $22,
            price_change_usd_1h = $23,
            price_change_usd_5m = $24,
            liquidity_usd = $25,
            liquidity_base = $26,
            liquidity_quote = $27,
            fdv_usd = $28,
            updated_at = NOW()
        WHERE pair_id = $29
        RETURNING *;
    `;
    return executeQuery(query, [
        coinDexMetricsData.coin_id,
        coinDexMetricsData.dex,
        coinDexMetricsData.base_token,
        coinDexMetricsData.quote_token,
        coinDexMetricsData.liquidity,
        coinDexMetricsData.fdv,
        coinDexMetricsData.pair_created_at,
        coinDexMetricsData.transactions,
        coinDexMetricsData.transactions_m5_buys,
        coinDexMetricsData.transactions_m5_sells,
        coinDexMetricsData.transactions_h1_buys,
        coinDexMetricsData.transactions_h1_sells,
        coinDexMetricsData.transactions_h6_buys,
        coinDexMetricsData.transactions_h6_sells,
        coinDexMetricsData.transactions_h24_buys,
        coinDexMetricsData.transactions_h24_sells,
        coinDexMetricsData.volume_usd_24h,
        coinDexMetricsData.volume_usd_6h,
        coinDexMetricsData.volume_usd_1h,
        coinDexMetricsData.volume_usd_5m,
        coinDexMetricsData.price_change_usd_24h,
        coinDexMetricsData.price_change_usd_6h,
        coinDexMetricsData.price_change_usd_1h,
        coinDexMetricsData.price_change_usd_5m,
        coinDexMetricsData.liquidity_usd,
        coinDexMetricsData.liquidity_base,
        coinDexMetricsData.liquidity_quote,
        coinDexMetricsData.fdv_usd,
        pairId,
    ], true);
}

// get functions

const getCoinDexMetricsByPairId = async (pairId) => {
    const query = `
        SELECT * FROM coin_dex_metrics WHERE pair_id = $1;
    `;
    return executeQuery(query, [pairId]);
}

const getCoinDexMetrics = async () => {
    const query = `
        SELECT * FROM coin_dex_metrics;
    `;
    return executeQuery(query);
}

export default{
    addCoinDexMetricsIfNotExists,
    updateCoinDexMetrics,
    getCoinDexMetricsByPairId,
    getCoinDexMetrics,
};
