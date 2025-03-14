const methods = require("../methods");
const Clients = require("./clients");
const logger = require("../config/logger");

const InsertOrUpdateCurrencyPricesData = async () => {
  try {
    logger.info(
      "Starting to insert or update currency prices data from exchange rate client."
    );
    const allCurrencyPrices = [];
    const allSupportesCurrencies =
      await Clients.exchangeRateClient.getAllSupportedCodes();
    const allPricesUsd =
      await Clients.exchangeRateClient.getAllCurrenciesUsdPrices();
    for (const currencyPair of allSupportesCurrencies["supported_codes"]) {
      allCurrencyPrices.push({
        currency_id: currencyPair[0],
        country: currencyPair[1],
        base_currency: "USD",
        price: allPricesUsd["conversion_rates"][currencyPair[0]],
      });
    }
    await methods.currencyPrices.addMultipleCurrencyPricesOrUpdate(
      allCurrencyPrices
    );
  } catch (error) {
    logger.error("Error while inserting currency prices data", error);
  }
};

module.exports = {
  InsertOrUpdateCurrencyPricesData,
};
