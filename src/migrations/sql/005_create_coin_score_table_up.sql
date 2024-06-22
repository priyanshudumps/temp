CREATE TABLE IF NOT EXISTS coin_score (
        coin_id VARCHAR(255) PRIMARY KEY REFERENCES coins(coin_id),
        score NUMERIC NULL,
        is_banned_panora BOOLEAN  NULL,
        is_permissioned_hippo BOOLEAN  NULL,
        coin_market_cap_rank INTEGER NULL,
        geckoterminal_score NUMERIC NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)

