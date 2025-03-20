
import * as schedule from "node-schedule";
import * as services from "../services";
import cacheData from "./dataCaching.job";

const startJobs = async () => {
  await cacheData();
  await services.coinListService.InsertOrUpdateDataFromCoinLists();
  // schedule for every 1 hour
  schedule.scheduleJob("0 * * * *", () => {
    services.coinListService.InsertOrUpdateDataFromCoinLists();
  });

  // schedule for every 5 minutes
  schedule.scheduleJob("*/5 * * * *", () => {
    services.dexDataService();
  });

  // schedule for every 10 minutes, TODO: change this according to CG & CMC rate limits
  schedule.scheduleJob("*/10 * * * *", () => {
    services.coinMetricsService.InsertOrUpdateCoinMetricsData();
  });

  // schedule for every 12 hours
  schedule.scheduleJob("0 */12 * * *", () => {
    services.currencyExchangeRatesService.InsertOrUpdateCurrencyPricesData();
  });
};




export default { startJobs };