const BASE_URL = 'https://api.geckoterminal.com/api/v2';
const HEADERS = {
    'Accept': 'application/json;version=20230302'
}

const fetchCoinDetailsByAddresses = async (addresses) => {
    const params = {
        network: 'aptos',
        addresses: addresses.join(',')
    };
    const url = `${BASE_URL}/tokens/multi`;
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${url}?${searchParams}`, { headers: HEADERS });
    return response.json();
}


