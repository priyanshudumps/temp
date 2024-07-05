CREATE TABLE IF NOT EXISTS currency_prices (
        currency_id VARCHAR(255) PRIMARY KEY,
        country VARCHAR(255),
        base_currency VARCHAR(255),
        price NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)

