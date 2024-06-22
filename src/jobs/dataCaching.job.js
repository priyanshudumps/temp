const  {cachingFunctions } = require('../services')

const job = async () =>{
    await cachingFunctions.updateCachedCoinData();
    await Promise.all([
        cachingFunctions.updateCachedCoinLinksData(),
        cachingFunctions.updateCachedCoinScoreData(),
        cachingFunctions.updateCachedCoinDexData()
    ])
}

module.exports = job