const { executeQuery } = require("../utils/queryExecutor");

/*

CREATE TABLE IF NOT EXISTS currency_prices (
        currency_id VARCHAR(255) PRIMARY KEY,
        country VARCHAR(255),
        base_currency VARCHAR(255),
        price NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)

*/

const addMultipleCurrencyPricesOrUpdate = async (currencyPriceData) => {
  const query = `
          INSERT INTO currency_prices (currency_id, country, base_currency, price)
          VALUES ${currencyPriceData
            .map(
              (_, index) =>
                `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${
                  index * 4 + 4
                })`
            )
            .join(", ")}
          ON CONFLICT (currency_id)
          DO UPDATE SET
          price = EXCLUDED.price
          RETURNING *;
      `;

  const values = currencyPriceData.reduce((acc, currencyPrice) => {
    acc.push(currencyPrice.currency_id);
    acc.push(currencyPrice.country);
    acc.push(currencyPrice.base_currency);
    acc.push(currencyPrice.price);
    return acc;
  }, []);

  return executeQuery(query, values);
};

const getAllCurrencyPrices = async () => {
  const query = `
        SELECT * FROM currency_prices;
    `;
  return executeQuery(query);
};

module.exports = {
  addMultipleCurrencyPricesOrUpdate,
  getAllCurrencyPrices,
};
