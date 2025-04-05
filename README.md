# aptos-coin-data-aggregator

## API Routes

### Token Charts

- `GET /token-charts/:tokenAddress` - Get chart data for a specific token
  - **Query Parameters**:
    - `timeframe` - One of: 'day', 'hour', 'minute' (default: 'day')
    - `limit` - Number of data points to return (optional)
    - `startDate` - Filter data from this date (optional)
    - `endDate` - Filter data until this date (optional)
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /token-charts/0x1::aptos_coin::AptosCoin?timeframe=hour&limit=24`

- `DELETE /token-charts/:tokenAddress/cache` - Invalidate cache for a specific token
  - **Example**: `DELETE /token-charts/0x1::aptos_coin::AptosCoin/cache`

### Coin Chats (Redis-cached)

- `GET /coin-chats/:coinId` - Get chat data for a specific coin
  - **Query Parameters**:
    - `limit` - Number of chats to return (default: 100)
    - `offset` - Offset for pagination (default: 0)
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /coin-chats/0x2250f54ffa4cc910af37a7e9f35691e40a81b5aa30d8664d07093c43ab17d628::Fuck::Fuck?limit=20&offset=0`

- `DELETE /coin-chats/:coinId/cache` - Invalidate cache for a specific coin's chats
  - **Example**: `DELETE /coin-chats/APT/cache`

### Emoji Coins

- `GET /emoji-coins/trending` - Get trending emoji coins data
  - **Query Parameters**:
    - `limit` - Number of trending coins to return (default: 50)
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /emoji-coins/trending?limit=10`

- `GET /emoji-coins/trades/:marketAddress` - Get historical trades for a specific emoji coin
  - **Query Parameters**:
    - `limit` - Number of trades to return (default: 500, max: 500)
    - `skip` - Number of trades to skip for pagination (default: 0)
    - `start_time` - Filter trades after this unix timestamp (optional)
    - `end_time` - Filter trades before this unix timestamp (optional)
    - `type` - Filter by trade type: 'buy' or 'sell' (optional)
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /emoji-coins/trades/0x0f12f1f89efe283884d30a9b8820c97c4a152294f11db706bc35df5cf9483e7a::coin_factory::Emojicoin_0x1::aptos_coin::AptosCoin`

- `GET /emoji-coins/coingecko/historical_trades` - Get historical trades in CoinGecko format
  - **Query Parameters**:
    - `ticker_id` - The ticker ID of the emoji coin (required)
    - `limit` - Number of trades to return (default: 500, max: 500)
    - `skip` - Number of trades to skip for pagination (default: 0)
    - `start_time` - Filter trades after this unix timestamp (optional)
    - `end_time` - Filter trades before this unix timestamp (optional)
    - `type` - Filter by trade type: 'buy' or 'sell' (optional)
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /emoji-coins/coingecko/historical_trades?ticker_id=0x17740e230cb5ac3f6eb16135fa1ce02baf9a07f2acfa884b33b0fb2f1bc2b91d&limit=50&skip=0&type=buy`

- `DELETE /emoji-coins/trending/cache` - Invalidate cache for trending emoji coins
  - **Example**: `DELETE /emoji-coins/trending/cache`

- `DELETE /emoji-coins/trades/:marketAddress/cache` - Invalidate cache for a specific emoji coin's trades
  - **Example**: `DELETE /emoji-coins/trades/0x17740e230cb5ac3f6eb16135fa1ce02baf9a07f2acfa884b33b0fb2f1bc2b91d/cache`

- `DELETE /emoji-coins/coingecko/historical_trades/cache` - Invalidate cache for CoinGecko format trades
  - **Query Parameters**:
    - `ticker_id` - The ticker ID of the emoji coin (required)
  - **Example**: `DELETE /emoji-coins/coingecko/historical_trades/cache?ticker_id=0x17740e230cb5ac3f6eb16135fa1ce02baf9a07f2acfa884b33b0fb2f1bc2b91d`

