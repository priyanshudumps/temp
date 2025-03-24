CREATE TABLE IF NOT EXISTS coin_chats (
    id BIGINT PRIMARY KEY,
    coin_id VARCHAR(255) REFERENCES coins(coin_id),
    content TEXT,
    image_url VARCHAR(255) NULL,
    created_by VARCHAR(255),
    reply_to BIGINT NULL,
    like_count INTEGER DEFAULT 0,
    user_name VARCHAR(255),
    user_image_url VARCHAR(255) NULL,
    is_dev BOOLEAN DEFAULT FALSE,
    is_liked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);