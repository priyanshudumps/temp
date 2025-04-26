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

### Uptos Pump Charts

- `GET /uptos-pump-charts/:tokenAddress` - Get chart data specifically from Uptos Pump
  - **Query Parameters**:
    - `startDate` - Filter data from this date (optional)
    - `endDate` - Filter data until this date (optional)
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /uptos-pump-charts/0x7159ef0384d530ba5aa176472c329897522b1b4a48363eacec4d7ff850c4e62e::APTARDIO::APTARDIO`

- `DELETE /uptos-pump-charts/:tokenAddress/cache` - Invalidate cache for Uptos Pump chart data
  - **Example**: `DELETE /uptos-pump-charts/0x7159ef0384d530ba5aa176472c329897522b1b4a48363eacec4d7ff850c4e62e::APTARDIO::APTARDIO/cache`

### Coin Chats (Redis-cached)

- `GET /coin-chats/:coinId` - Get chat data for a specific coin
  - **Query Parameters**:
    - `limit` - Number of chats to return (default: 100)
    - `offset` - Offset for pagination (default: 0)
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /coin-chats/0x2250f54ffa4cc910af37a7e9f35691e40a81b5aa30d8664d07093c43ab17d628::Fuck::Fuck?limit=20&offset=0`

- `DELETE /coin-chats/:coinId/cache` - Invalidate cache for a specific coin's chats
  - **Example**: `DELETE /coin-chats/APT/cache`

### Coin Holders (Redis-cached)

- `GET /coin-holders/:coinId` - Get holders data for a specific coin
  - **Query Parameters**:
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /coin-holders/0x13b72f092e5fa171eb85fed63b0c71786f7c826a96ff8c5b832770135a6a008::CRAB::CRAB`
  

- `DELETE /coin-holders/:coinId/cache` - Invalidate cache for a specific coin's holders
  - **Example**: `DELETE /coin-holders/0x2250f54ffa4cc910af37a7e9f35691e40a81b5aa30d8664d07093c43ab17d628::Fuck::Fuck/cache`

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

- `GET /emoji-coins/market-trades/:tokenAddress` - Get market trades for a specific token address
  - **Query Parameters**:
    - `page` - Page number for pagination (default: 1)
    - `limit` - Number of trades to return per page (default: 100)
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /emoji-coins/market-trades/0xb7397fc01a0dd28b9ac64b06a35b7c68454f88de5d35bb3dc8a9ffcc16306875::coin_factory::Emojicoin?page=1&limit=50`

- `GET /emoji-coins/holders/:tokenAddress` - Get holders data for a specific emoji coin
  - **Query Parameters**:
    - `offset` - Offset for pagination (default: 0)
    - `limit` - Number of holders to return per page (default: 100)
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /emoji-coins/holders/0xb7397fc01a0dd28b9ac64b06a35b7c68454f88de5d35bb3dc8a9ffcc16306875::coin_factory::Emojicoin?offset=0&limit=50`

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

- `DELETE /emoji-coins/market-trades/:tokenAddress/cache` - Invalidate cache for a specific token's market trades
  - **Example**: `DELETE /emoji-coins/market-trades/0x4d5baf086232716a5aac19ce9675f020bb9e3811643cd5d22870fd5f7382f001/cache`

- `DELETE /emoji-coins/holders/:tokenAddress/cache` - Invalidate cache for a specific token's holders
  - **Example**: `DELETE /emoji-coins/holders/0xb7397fc01a0dd28b9ac64b06a35b7c68454f88de5d35bb3dc8a9ffcc16306875::coin_factory::Emojicoin/cache`

- `DELETE /emoji-coins/coingecko/historical_trades/cache` - Invalidate cache for CoinGecko format trades
  - **Query Parameters**:
    - `ticker_id` - The ticker ID of the emoji coin (required)
  - **Example**: `DELETE /emoji-coins/coingecko/historical_trades/cache?ticker_id=0x17740e230cb5ac3f6eb16135fa1ce02baf9a07f2acfa884b33b0fb2f1bc2b91d`
  

### Aptos Price

- `GET /aptos-price` - Get current price of APT in USD
  - **Query Parameters**:
    - `skipCache` - Set to 'true' to bypass cache (default: 'false')
  - **Example**: `GET /aptos-price`

- `DELETE /aptos-price/cache` - Invalidate cache for APT price
  - **Example**: `DELETE /aptos-price/cache`
  

