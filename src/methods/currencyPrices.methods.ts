import { executeQuery } from '../utils/queryExecutor';
import { ICurrencyPrice } from '../types';

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

export const addMultipleCurrencyPricesOrUpdate = async (currencyPriceData: ICurrencyPrice[]): Promise<ICurrencyPrice[]> => {
  const query = `
          INSERT INTO currency_prices (currency_id, country, base_currency, price)
          VALUES ${currencyPriceData
            .map(
              (_, index) =>
                `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${
                  index * 4 + 4
                })`
            )
            .join(', ')}
          ON CONFLICT (currency_id)
          DO UPDATE SET
          price = EXCLUDED.price
          RETURNING *;
      `;

  const values = currencyPriceData.reduce<any[]>((acc, currencyPrice) => {
    acc.push(currencyPrice.currency_id);
    acc.push(currencyPrice.country);
    acc.push(currencyPrice.base_currency);
    acc.push(currencyPrice.price);
    return acc;
  }, []);

  return executeQuery<ICurrencyPrice>(query, values);
};

export const getAllCurrencyPrices = async (): Promise<ICurrencyPrice[]> => {
  const query = `
        SELECT * FROM currency_prices;
    `;
  return executeQuery<ICurrencyPrice>(query);
};