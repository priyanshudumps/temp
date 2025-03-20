import config from '../../config/config';

const BASE_URL = "https://v6.exchangerate-api.com/v6";

interface SupportedCodesResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  supported_codes: [string, string][];
}

interface CurrencyRatesResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

export const getAllSupportedCodes = async (): Promise<SupportedCodesResponse> => {
  const url = `${BASE_URL}/${config.exchangeRateApiKey}/codes`;
  const response = await fetch(url);
  return response.json();
};

export const getAllCurrenciesUsdPrices = async (): Promise<CurrencyRatesResponse> => {
  const url = `${BASE_URL}/${config.exchangeRateApiKey}/latest/USD`;
  const response = await fetch(url);
  return response.json();
};

export default {
  getAllSupportedCodes,
  getAllCurrenciesUsdPrices,
};