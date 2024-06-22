const methods = require("../methods");
const CoinClients = require("./clients");
const constants = require("../constants");
const logger = require("../config/logger");

const InsertOrUpdateDataFromDexes = async () => {
    logger.info('Starting to fetch dex data from dexscreener.');
    const addresses = Object.keys(constants.cache.COINS);
    for(const address of addresses){
        const dexscreenerData = await CoinClients.dexscreenerData.fetchCoinDetailsFromAddress(address);
        constants.cache.COIN_DEX_METRICS[address] = [];

        for(const pair of dexscreenerData.pairs){
            const pair_created_at = pair.pairCreatedAt? new Date(pair.pairCreatedAt): null;
            constants.cache.COIN_DEX_METRICS[address].push({
                coin_id : address,
                pair_id : pair.pairAddress,
                dex : pair.dexId,
                base_token : pair.baseToken?.address,
                quote_token : pair.quoteToken?.address,
                pair_created_at : pair_created_at,
                
                transactions_m5_buys : pair.txns?.m5?.buys,
                transactions_m5_sells : pair.txns?.m5?.sells,
                transactions_h1_buys : pair.txns?.h1?.buys,
                transactions_h1_sells : pair.txns?.h1?.sells,
                transactions_h6_buys : pair.txns?.h6?.buys,
                transactions_h6_sells : pair.txns?.h6?.sells,
                transactions_h24_buys : pair.txns?.h24?.buys,
                transactions_h24_sells : pair.txns?.h24?.sells,

                volume_usd_24h : pair.volume?.h24,
                volume_usd_6h : pair.volume?.h6,
                volume_usd_1h : pair.volume?.h1,
                volume_usd_5m : pair.volume?.m5,

                price_change_usd_24h : pair.priceChange?.h24,
                price_change_usd_6h : pair.priceChange?.h6,
                price_change_usd_1h : pair.priceChange?.h1,
                price_change_usd_5m : pair.priceChange?.m5,

                liquidity_usd : pair.liquidity?.usd,
                liquidity_base : pair.liquidity?.base,
                liquidity_quote : pair.liquidity?.quote,

                fdv_usd : pair.fdv,
            })
        }
        if (constants.cache.COIN_DEX_METRICS[address].length > 0){
            methods.coinDexMetrics.addCoinMultipleDexMetricsOrUpdate(constants.cache.COIN_DEX_METRICS[address]);
        }
    }
    logger.info('Fetched dex data from dexscreener.');
}

module.exports = InsertOrUpdateDataFromDexes