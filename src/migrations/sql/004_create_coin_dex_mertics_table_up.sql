CREATE TABLE IF NOT EXISTS coin_dex_metrics (
        coin_id VARCHAR(255) REFERENCES coins(coin_id),
        
        pair_id VARCHAR(255) PRIMARY KEY,
        dex VARCHAR(255),
        base_token VARCHAR(255),
        quote_token VARCHAR(255),
        pair_created_at TIMESTAMPTZ NUll,

        transactions_m5_buys NUMERIC NULL,
        transactions_m5_sells NUMERIC NULL,

        transactions_h1_buys NUMERIC NULL,
        transactions_h1_sells NUMERIC NULL,

        transactions_h6_buys NUMERIC NULL,
        transactions_h6_sells NUMERIC NULL,

        transactions_h24_buys NUMERIC NULL,
        transactions_h24_sells NUMERIC NULL,

        volume_usd_24h NUMERIC NULL,
        volume_usd_6h NUMERIC NULL,
        volume_usd_1h NUMERIC NULL,
        volume_usd_5m NUMERIC NULL,

        price_change_usd_24h NUMERIC NULL,
        price_change_usd_6h NUMERIC NULL,
        price_change_usd_1h NUMERIC NULL,
        price_change_usd_5m NUMERIC NULL,

        liquidity_usd NUMERIC NULL,
        liquidity_base NUMERIC NULL,
        liquidity_quote NUMERIC NULL,

        fdv_usd NUMERIC NULL,


        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)

