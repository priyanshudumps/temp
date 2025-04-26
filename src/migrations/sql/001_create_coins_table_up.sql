CREATE TABLE IF NOT EXISTS coins (
        coin_id VARCHAR(255) NOT NULL,
        coin_type_legacy VARCHAR(255) NULL,
        coin_address_fungible VARCHAR(255) NULL,

        coin_name VARCHAR(255) NULL,
        coin_symbol VARCHAR(255) NULL,
        coin_defyapp_symbol VARCHAR(255) NULL,
        coin_decimals INTEGER NOT NULL,
        coin_description TEXT NULL,
        coin_logo_url VARCHAR(255) NULL,
 
        coingecko_id VARCHAR(255) NULL,
        coinmarketcap_id VARCHAR(255) NULL,
        is_graduated VARCHAR(255) NULL,
        bonding_curve_progress INTEGER NULL,
        market_id VARCHAR(255) NULL,
        market_cap_usd BIGINT NULL,
        

        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (coin_id)
)