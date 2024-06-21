const {coinMarketCapApiKey} = require('../../config/config')


const BASE_URL  = 'https://pro-api.coinmarketcap.com';
const HEADERS = {
    'Accept': 'application/json',
    'X-CMC_PRO_API_KEY': coinMarketCapApiKey
}


const getMetadataByIds = async (ids) => {
    const params = {
        id: ids.join(','),
        skip_invalid: true,
        aux: 'urls,logo,description,tags,platform,date_added,notice,status',
    };
    const url = `${BASE_URL}/v2/cryptocurrency/info`;
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${url}?${searchParams}`, { headers: HEADERS });
    return response.json();
}

const getLatestQuoteByIds = async (ids) => {
    const params = {
        id: ids.join(','),
        aux: 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply,market_cap_by_total_supply,volume_24h_reported,volume_7d,volume_7d_reported,volume_30d,volume_30d_reported,is_active,is_fiat',
        skip_invalid: true,
    };

    console.log(params)
    const url = `${BASE_URL}/v2/cryptocurrency/quotes/latest`;
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${url}?${searchParams}`, { headers: HEADERS });
    return response.json();
}

module.exports = {
    getMetadataByIds,
    getLatestQuoteByIds
}