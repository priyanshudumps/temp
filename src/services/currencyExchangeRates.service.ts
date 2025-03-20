import methods from '../methods';
import Clients from './clients';
import logger from '../config/logger';
import { ICurrencyPrice } from '../types';

interface ExchangeRateResponse {
  supported_codes: [string, string][];
}

interface CurrencyPricesResponse {
  conversion_rates: Record<string, number>;
}

const InsertOrUpdateCurrencyPricesData = async (): Promise<void> => {
  try {
    logger.info(
      "Starting to insert or update currency prices data from exchange rate client."
    );
    const allCurrencyPrices: ICurrencyPrice[] = [];
    
    const allSupportesCurrencies: ExchangeRateResponse =
      await Clients.exchangeRateClient.getAllSupportedCodes();
      
    const allPricesUsd: CurrencyPricesResponse =
      await Clients.exchangeRateClient.getAllCurrenciesUsdPrices();
      
    for (const currencyPair of allSupportesCurrencies.supported_codes) {
      allCurrencyPrices.push({
        currency_id: currencyPair[0],
        country: currencyPair[1],
        base_currency: "USD",
        price: allPricesUsd.conversion_rates[currencyPair[0]],
      });
    }
    
    await methods.currencyPrices.addMultipleCurrencyPricesOrUpdate(
      allCurrencyPrices
    );
    
    logger.info("Successfully updated currency prices data.");
  } catch (error) {
    logger.error(`Error while inserting currency prices data: ${(error as Error).message}`);
  }
};

export default { InsertOrUpdateCurrencyPricesData };