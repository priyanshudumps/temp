
const methods = require("../methods");
const CoinClients = require("./clients");
const constants = require("../constants");
const logger = require("../config/logger");

//const fs = require('fs');
//const path = require('path');

// const logToFile = async (message) => {
//   const logPath = path.join(__dirname, '../../log3.txt');
//   await fs.promises.appendFile(logPath, message + '\n', 'utf8');
// };

// const fetchAllApiDataForCoin = async (coin) => {
//   await logToFile(`\n=== DATA FOR TOKEN: ${coin.name} (${coin.symbol}) ===\n`);
//   await logToFile(JSON.stringify(coin, null, 2));

//   // DexScreener data
//   await logToFile("\n--- DEXSCREENER DATA ---\n");
//   try {
//     const dexScreenerData = await CoinClients.dexscreenerData.fetchCoinDetailsFromAddress(coin.tokenAddress);
//     await logToFile(JSON.stringify(dexScreenerData, null, 2));
//   } catch (error) {
//     await logToFile(`Error fetching DexScreener data: ${error.message}`);
//   }
  
//   // CoinGecko data
//   await logToFile("\n--- COINGECKO DATA ---\n");
//   if (coin.coinGeckoId) {
//     try {
//       const coinGeckoData = await CoinClients.coinGeckoClient.getPriceByIds([coin.coinGeckoId]);
//       await logToFile(JSON.stringify(coinGeckoData, null, 2));
//     } catch (error) {
//       await logToFile(`Error fetching CoinGecko data: ${error.message}`);
//     }
//   } else {
//     await logToFile("No CoinGecko ID available for this token");
//   }
  
//   // CoinMarketCap data
//   await logToFile("\n--- COINMARKETCAP DATA ---\n");
//   if (coin.coinMarketCapId) {
//     try {
//       const coinMarketCapData = await CoinClients.coinMarketcapClient.getLatestQuoteByIds([coin.coinMarketCapId]);
//       await logToFile(JSON.stringify(coinMarketCapData, null, 2));
//     } catch (error) {
//       await logToFile(`Error fetching CoinMarketCap data: ${error.message}`);
//     }
//   } else {
//     await logToFile("No CoinMarketCap ID available for this token");
//   }
  
//   // GeckoTerminal data
//   await logToFile("\n--- GECKOTERMINAL DATA ---\n");
//   try {
//     const correctUrl = `https://api.geckoterminal.com/api/v2/networks/aptos/tokens/${encodeURIComponent(coin.tokenAddress)}`;
//     const headers = { "Accept": "application/json;version=20230302" };
//     const response = await fetch(correctUrl, { headers });
//     const geckoTerminalData = await response.json();
//     await logToFile(JSON.stringify(geckoTerminalData, null, 2));
//   } catch (error) {
//     await logToFile(`Error fetching GeckoTerminal data: ${error.message}`);
//   }
// };

const InsertOrUpdateDataFromCoinListsWithFullApiData = async () => {
  logger.info("Starting to gather API data for all tokens in Panora coin list");
  
  // try {
  //   // Create log header with timestamp
  //   await logToFile(`\n=== COMPLETE API DATA COLLECTION: ${new Date().toISOString()} ===\n`);
    
  //   // Get Exchange Rate API data once (applies to all coins)
  //   await logToFile("\n=== EXCHANGE RATE API DATA ===\n");
  //   try {
  //     const exchangeRateData = await CoinClients.exchangeRateClient.getAllSupportedCodes();
  //     await logToFile(JSON.stringify(exchangeRateData, null, 2));
  //   } catch (error) {
  //     await logToFile(`Error fetching Exchange Rate data: ${error.message}`);
  //   }
    
  //   // Get Panora Coin List
  //   const panoraCoinList = await CoinClients.panoraCoinClient();
  //   await logToFile(`\nTotal tokens in Panora Coin List: ${panoraCoinList.length}\n`);
    
  //   // Process each coin (limiting to first 10 to avoid rate limits)
  //   const coinsToProcess = panoraCoinList.slice(0, 10);
  //   for (const coin of coinsToProcess) {
  //     await fetchAllApiDataForCoin(coin);
  //   }
    
  //   logger.info(`Completed API data collection for ${coinsToProcess.length} tokens`);
  // } catch (error) {
  //   logger.error(`Error collecting API data: ${error.message}`);
  //   await logToFile(`\n=== ERROR COLLECTING API DATA ===\n${error.stack}`);
  // }


  const panoraCoinList = await CoinClients.panoraCoinClient();

  for (const coin of panoraCoinList) {

    // since tokenaddress can be null using faAddress as the key

    if (!constants.cache.COINS[coin.faAddress]) {
      constants.cache.COINS[coin.faAddress] = {};
    }
    if (!constants.cache.COIN_SCORE[coin.faAddress]) {
      constants.cache.COIN_SCORE[coin.faAddress] = {};
    }
    if (!constants.cache.COIN_LINKS[coin.faAddress]) {
      constants.cache.COIN_LINKS[coin.faAddress] = {};
    }

    const coin_type_legacy = coin?.tokenAddress?.includes("::")
      ? coin.tokenAddress
      : constants.cache.COINS[coin.tokenAddress]
      ? constants.cache.COINS[coin.tokenAddress].coin_type_legacy
        ? constants.cache.COINS[coin.tokenAddress].coin_type_legacy
        : null
      : null;
    const coin_address_fungible = coin?.tokenAddress?.includes("::")
      ? null
      : constants.cache.COINS[coin.tokenAddress]
      ? constants.cache.COINS[coin.tokenAddress].coin_address_fungible
        ? constants.cache.COINS[coin.tokenAddress].coin_address_fungible
        : null
      : null;
    
    

    // sets coin id as faAddress if it exists, otherwise it's tokenAddress

    const hasFungibleAddress = Boolean(coin.faAddress)
    if (hasFungibleAddress) {
      constants.cache.COINS[coin.faAddress].coin_id = coin.faAddress;
      constants.cache.COIN_SCORE[coin.faAddress].coin_id = coin.faAddress;
      constants.cache.COIN_LINKS[coin.faAddress].coin_id = coin.faAddress;
    }
    else {
      constants.cache.COINS[coin.tokenAddress].coin_id = coin.tokenAddress;
      constants.cache.COIN_SCORE[coin.tokenAddress].coin_id = coin.tokenAddress;
      constants.cache.COIN_LINKS[coin.tokenAddress].coin_id = coin.tokenAddress;
    }

    //constants.cache.COINS[coin.faAddress].coin_id = coin.faAddress;
    constants.cache.COINS[coin.faAddress].coin_type_legacy =
    coin.tokenAddress;
    constants.cache.COINS[coin.faAddress].coin_address_fungible =
    coin.faAddress;
    constants.cache.COINS[coin.faAddress].coin_name = coin.name;
    constants.cache.COINS[coin.faAddress].coin_symbol = coin.symbol;
    constants.cache.COINS[coin.faAddress].coin_defyapp_symbol =
      coin.panoraSymbol;
    constants.cache.COINS[coin.faAddress].coin_decimals = coin.decimals;
    constants.cache.COINS[coin.faAddress].coin_logo_url = coin.logoUrl;
    constants.cache.COINS[coin.faAddress].coingecko_id = coin.coinGeckoId;
    constants.cache.COINS[coin.faAddress].coinmarketcap_id =
      coin.coinMarketCapId;

    //constants.cache.COIN_SCORE[coin.faAddress].coin_id = coin.faAddress;
    constants.cache.COIN_SCORE[coin.faAddress].is_banned_panora =
      coin.isBanned;

    //constants.cache.COIN_LINKS[coin.faAddress].coin_id = coin.faAddress;
    constants.cache.COIN_LINKS[coin.faAddress].website = coin.websiteUrl;
    // constants.cache.COIN_LINKS[coin.tokenAddress].tags = [coin.bridge, coin.category];
  }

  const CoinsArray = Object.values(constants.cache.COINS);
  const CoinScoresArray = Object.values(constants.cache.COIN_SCORE);
  const CoinLinksArray = Object.values(constants.cache.COIN_LINKS);

  // this is outside promise.all because we need to wait
  // for coins to be inserted first so that we do not violate foreign key constraints
  // if any new coin is added
  await methods.coins.addMultipleCoinsOrUpdate(CoinsArray),
    await Promise.all([
      methods.coinLinks.addMultipleCoinLinksOrUpdate(CoinLinksArray),
      methods.coinScores.addMultipleCoinScoresOrUpdate(CoinScoresArray),
    ]);
  logger.info(
    "Finished inserting or updating coin data from hippo and panora."
  );
};

module.exports = {
  InsertOrUpdateDataFromCoinLists: InsertOrUpdateDataFromCoinListsWithFullApiData,
};