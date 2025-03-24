const { cachingFunctions } = require("../services");

const job = async () => {
  // why is this outside promise.all?
  // if all of these functions are called in parallel,
  // then multiple connections pools to the database will be created
  await cachingFunctions.updateCachedCoinData();
  await Promise.all([
    cachingFunctions.updateCachedCoinLinksData(),
    cachingFunctions.updateCachedCoinScoreData(),
    cachingFunctions.updateCachedCoinDexData(),
    cachingFunctions.updateCachedCoinMetricsData(),
    cachingFunctions.updateCachedCoinChatsData(), 
  ]);
};

export default job;