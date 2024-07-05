const { exchangeRateApiKey } = require("../../config/config");

const BASE_URL = "https://v6.exchangerate-api.com/v6";

const getAllSupportedCodes = async (ids) => {
  const url = `${BASE_URL}/${exchangeRateApiKey}/codes`;
  const response = await fetch(url);
  return response.json();
};

const getAllCurrenciesUsdPrices = async (ids) => {
  const url = `${BASE_URL}/${exchangeRateApiKey}/latest/USD`;
  const response = await fetch(url);
  return response.json();
};

module.exports = {
  getAllSupportedCodes,
  getAllCurrenciesUsdPrices,
};
