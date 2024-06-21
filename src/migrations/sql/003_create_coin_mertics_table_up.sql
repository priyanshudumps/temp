CREATE TABLE IF NOT EXISTS coin_metrics (
        coin_id VARCHAR(255) PRIMARY KEY REFERENCES coins(coin_id),
        
        circulating_supply NUMERIC NULL,
        total_supply NUMERIC NULL,
        max_supply NUMERIC NULL,
        holders NUMERIC NULL,

        price_usd NUMERIC NULL,
        price_change_5m NUMERIC NULL,
        price_change_1hr NUMERIC NULL,
        price_change_6hr NUMERIC NULL,
        price_change_24h NUMERIC NULL,
        price_change_7d NUMERIC NULL,
        price_change_30d NUMERIC NULL,

        market_cap NUMERIC NULL,
        fully_diluted_market_cap NUMERIC NULL,
        usd_24h_vol NUMERIC NULL,

        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)