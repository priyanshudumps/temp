CREATE TABLE IF NOT EXISTS coin_links (
        coin_id VARCHAR(255) PRIMARY KEY REFERENCES coins(coin_id),
        twitter VARCHAR(255) NULL,
        telegram VARCHAR(255) NULL,
        discord VARCHAR(255) NULL,
        github VARCHAR(255) NULL,
        website VARCHAR(255) NULL,
        whitepaper VARCHAR(255) NULL,
        medium VARCHAR(255) NULL,
        linkedin VARCHAR(255) NULL,
        youtube VARCHAR(255) NULL,
        reddit VARCHAR(255) NULL,
        facebook VARCHAR(255) NULL,
        instagram VARCHAR(255) NULL,
        tiktok VARCHAR(255) NULL,
        forum VARCHAR(255) NULL,
        other_links VARCHAR(255)[] Null,
        tags VARCHAR(255)[] NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)