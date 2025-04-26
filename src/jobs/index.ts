
import * as schedule from "node-schedule";
import * as services from "../services";
import cacheData from "./dataCaching.job";
import uptosPumpLegendJob from "./uptosPumpLegend.job";


const startJobs = async () => {
  await cacheData();
  await services.coinListService.InsertOrUpdateDataFromCoinLists();
  await services.dexDataService();
  // schedule for every  2 hour
  schedule.scheduleJob("0 */2 * * *", () => {
    services.coinListService.InsertOrUpdateDataFromCoinLists();
  });

  // schedule for every 1 hour
  // schedule.scheduleJob("0 * * * *", () => {
  //   services.dexDataService();
  // });

  //schedule for every 10 minutes, TODO: change this according to CG & CMC rate limits
  // schedule.scheduleJob("*/10 * * * *", () => {
  //   services.coinMetricsService.InsertOrUpdateCoinMetricsData();
  // });

  // schedule for every 12 hours currency exchange rates
  schedule.scheduleJob("0 */12 * * *", () => {
    services.currencyExchangeRatesService.InsertOrUpdateCurrencyPricesData();
  });

  schedule.scheduleJob("0 */12 * * *", () => {
    services.coinChatsService.InsertOrUpdateCoinChatsData();
  });
    
  schedule.scheduleJob("0 */12 * * *", () => {
    uptosPumpLegendJob();
  });

};




export default { startJobs };