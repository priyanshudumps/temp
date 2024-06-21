const { coingeckoApiKey } = require("../../config/config");

const BASE_URL = "https://api.coingecko.com/api/v3";
const HEADERS = {
  Accept: "application/json",
  "x-cg-api-key": coingeckoApiKey,
};

const getPriceByIds = async (ids) => {
  const params = {
    ids: ids.join(","),
    vs_currencies: "usd",
    include_market_cap: true,
    include_24hr_vol: true,
    include_24hr_change: true,
    include_last_updated_at: true,
    include_ohlc: true,
  };
  const url = `${BASE_URL}/simple/price`;
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`${url}?${searchParams}`, { headers: HEADERS });
  return response.json();
};

const getCoinDataById = async (id) => {
  const params = {
    // id: "aptos",
    localization: false,
    tickers: false,
    market_data: false,
    community_data: true,
    developer_data: false,
    sparkline: false,
  };
  const url = `${BASE_URL}/coins/${id}`;
  const searchParams = new URLSearchParams(params);
  console.log(`${url}?${searchParams}`);
  const response = await fetch(`${url}?${searchParams}`, { headers: HEADERS });
  return response.json();
};

module.exports = {
  getPriceByIds,
  getCoinDataById,
};
