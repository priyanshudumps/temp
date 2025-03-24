import uptosPumpLegendService from "../services/uptosPumpLegend.service";
import logger from "../config/logger";

const job = async () => {
  logger.info("Starting Uptos Pump Legend job");
  try {
    await uptosPumpLegendService.fetchAndStoreCurrentLegendToken();
    logger.info("Uptos Pump Legend job completed successfully");
  } catch (error) {
    logger.error(`Error in Uptos Pump Legend job: ${(error as Error).message}`);
  }
};

export default job;