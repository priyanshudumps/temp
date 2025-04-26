import methods from '../methods';
import CoinClients from './clients';
import constants from '../constants';
import logger from '../config/logger';
import { ICoin, ICoinLinks, ICoinScore, ICoinMetrics } from '../types';
import * as emojiCoinService from './emojiCoin.service';

const InsertOrUpdateDataFromCoinLists = async (): Promise<void> => {
  logger.info("[Data Aggregation] Starting data aggregation process...");
  
  // --- Panora Coin List --- 
  logger.info("[Panora] Starting Panora coin list processing...");
  try {
    const panoraCoinList = await CoinClients.panoraCoinClient();
    logger.info(`[Panora] Fetched ${panoraCoinList.length} coins from Panora API.`);
   // console.log(panoraCoinList[0]);

    for (const coin of panoraCoinList) {
      // since tokenaddress can be null using faAddress as the key
      if (!constants.cache.COINS[coin.faAddress]) {
        constants.cache.COINS[coin.faAddress] = {} as ICoin;
      }
      if (!constants.cache.COIN_SCORE[coin.faAddress]) {
        constants.cache.COIN_SCORE[coin.faAddress] = {} as ICoinScore;
      }
      if (!constants.cache.COIN_LINKS[coin.faAddress]) {
        constants.cache.COIN_LINKS[coin.faAddress] = {} as ICoinLinks;
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
      const hasFungibleAddress = Boolean(coin.faAddress);
      if (hasFungibleAddress) {
        constants.cache.COINS[coin.faAddress].coin_id = coin.faAddress;
        constants.cache.COIN_SCORE[coin.faAddress].coin_id = coin.faAddress;
        constants.cache.COIN_LINKS[coin.faAddress].coin_id = coin.faAddress;
      } else {
        constants.cache.COINS[coin.tokenAddress].coin_id = coin.tokenAddress;
        constants.cache.COIN_SCORE[coin.tokenAddress].coin_id = coin.tokenAddress;
        constants.cache.COIN_LINKS[coin.tokenAddress].coin_id = coin.tokenAddress;
      }

      constants.cache.COINS[coin.faAddress].coin_type_legacy = coin.tokenAddress;
      constants.cache.COINS[coin.faAddress].coin_address_fungible = coin.faAddress;
      constants.cache.COINS[coin.faAddress].coin_name = coin.name;
      constants.cache.COINS[coin.faAddress].coin_symbol = coin.symbol;
      constants.cache.COINS[coin.faAddress].coin_defyapp_symbol = coin.panoraSymbol;
      constants.cache.COINS[coin.faAddress].coin_decimals = coin.decimals;
      constants.cache.COINS[coin.faAddress].coin_logo_url = coin.logoUrl;
      constants.cache.COINS[coin.faAddress].coingecko_id = coin.coinGeckoId;
      constants.cache.COINS[coin.faAddress].coinmarketcap_id = coin.coinMarketCapId;
      constants.cache.COINS[coin.faAddress].is_graduated = null;
      constants.cache.COINS[coin.faAddress].bonding_curve_progress = null;

      constants.cache.COIN_SCORE[coin.faAddress].is_banned_panora = coin.isBanned;

      constants.cache.COIN_LINKS[coin.faAddress].website = coin.websiteUrl;
    }

    const CoinsArray = Object.values(constants.cache.COINS);
    const CoinScoresArray = Object.values(constants.cache.COIN_SCORE);
    const CoinLinksArray = Object.values(constants.cache.COIN_LINKS);

    logger.info(`[Panora] Prepared ${CoinsArray.length} coin records for database update.`);
    await methods.coins.addMultipleCoinsOrUpdate(CoinsArray);
    logger.info(`[Panora] Inserted/Updated ${CoinsArray.length} coins.`);
    await Promise.all([
      methods.coinLinks.addMultipleCoinLinksOrUpdate(CoinLinksArray),
      methods.coinScores.addMultipleCoinScoresOrUpdate(CoinScoresArray),
    ]);
    logger.info(`[Panora] Inserted/Updated related links and scores.`);
    
    logger.info("[Panora] Finished Panora coin list processing.");
  } catch (error) {
    logger.error(`[Panora] Error processing Panora coin list:`, error);
  }
  
  logger.info("Starting to gather API data for all tokens in Uptos Pump coin list");

  try {
    const uptosPumpCoinList = await CoinClients.uptosPumpClient();
    //console.log(uptosPumpCoinList[0]);
    
    logger.info("[Uptos Pump] Starting Uptos Pump coin list processing...");
    let skippedCount = 0;
    for (const coin of uptosPumpCoinList) {
      // Use addr as the coin_id for Uptos Pump coins
      const coinId = coin.addr;
      
      if (!coinId) {
        logger.warn(`[Uptos Pump] Skipping Uptos Pump coin with missing address: ${coin.name}`);
        skippedCount++;
        continue;
      }
      
      if (!constants.cache.COINS[coinId]) {
        constants.cache.COINS[coinId] = {} as ICoin;
      }
      if (!constants.cache.COIN_SCORE[coinId]) {
        constants.cache.COIN_SCORE[coinId] = {} as ICoinScore;
      }
      if (!constants.cache.COIN_LINKS[coinId]) {
        constants.cache.COIN_LINKS[coinId] = {} as ICoinLinks;
      }
      if (!constants.cache.COIN_METRICS[coinId]) {
        constants.cache.COIN_METRICS[coinId] = {} as ICoinMetrics;
      }
      
      let price_apt = 0;
      if (coin.virtualAptosReserves && coin.virtualTokenReserves) {
        try {
          const virtualAptosReservesBigInt = BigInt(coin.virtualAptosReserves);
          const virtualTokenReservesBigInt = BigInt(coin.virtualTokenReserves);
          
          price_apt = Number(
            (virtualAptosReservesBigInt * BigInt(100000000)) / 
            (virtualTokenReservesBigInt + BigInt(100000000))
          );
        } catch (e) {
          logger.error(`[Uptos Pump] Error calculating price for coin ${coinId}:`, e);
        }
      }
      
      constants.cache.COINS[coinId].coin_id = coinId;
      constants.cache.COINS[coinId].coin_type_legacy = coinId;
      constants.cache.COINS[coinId].coin_name = coin.name;
      constants.cache.COINS[coinId].coin_symbol = coin.ticker;
      constants.cache.COINS[coinId].coin_decimals = 8; // Default for Aptos coins if not specified
      constants.cache.COINS[coinId].coin_description = coin.description;
      constants.cache.COINS[coinId].coin_logo_url = coin.img;
      
      // Calculate is_graduated based on mCap field
      constants.cache.COINS[coinId].is_graduated = coin.mCap >= 36210 ? 'true' : 'false';
      
      // Calculate bonding_curve_progress based on virtualTokenReserves field
      try {
        if (coin.virtualTokenReserves) {
          const virtualTokenReservesBigInt = BigInt(coin.virtualTokenReserves);
          const initialTokenReservesBigInt = coin.initialTokenReserves ? BigInt(coin.initialTokenReserves) : BigInt('1000000000000000');
          
          if (virtualTokenReservesBigInt.toString() === '200000000000000') {
            constants.cache.COINS[coinId].bonding_curve_progress = 100; // 100% if equals 200000000000000
          } else if (virtualTokenReservesBigInt.toString() === '100000000000000') {
            constants.cache.COINS[coinId].bonding_curve_progress = 50; // 50% if equals 100000000000000
          } else {
            // Calculate the percentage
            const progressPercentage = Number(
              (virtualTokenReservesBigInt * BigInt(100)) / initialTokenReservesBigInt
            );
            constants.cache.COINS[coinId].bonding_curve_progress = progressPercentage > 100 ? 100 : progressPercentage;
          }
        } else {
          constants.cache.COINS[coinId].bonding_curve_progress = null;
        }
      } catch (e) {
        logger.error(`[Uptos Pump] Error calculating bonding curve progress for coin ${coinId}:`, e);
        constants.cache.COINS[coinId].bonding_curve_progress = null;
      }
      
      constants.cache.COIN_SCORE[coinId].coin_id = coinId;
      constants.cache.COIN_SCORE[coinId].score = coin.repC;
      
      constants.cache.COIN_METRICS[coinId].coin_id = coinId;
      constants.cache.COIN_METRICS[coinId].price_usd = price_apt; // Store calculated price todo: implement apt to usd conversion
      
      
      constants.cache.COIN_METRICS[coinId].infinite_supply = false; // Set default value or derive from data
      


      if (coin.virtualTokenReserves) {
        try {
          const virtualTokenReservesBigInt = BigInt(coin.virtualTokenReserves);
          const circulating_supply = Number(virtualTokenReservesBigInt / BigInt(100000000));
          constants.cache.COIN_METRICS[coinId].circulating_supply = circulating_supply;
          constants.cache.COIN_METRICS[coinId].market_cap = price_apt * circulating_supply;
        } catch (e) {
          logger.error(`[Uptos Pump] Error calculating market metrics for coin ${coinId}:`, e);
        }
      }
      
      constants.cache.COIN_LINKS[coinId].coin_id = coinId;
      if (coin.twitter) constants.cache.COIN_LINKS[coinId].twitter = coin.twitter;
      if (coin.telegram) constants.cache.COIN_LINKS[coinId].telegram = coin.telegram;
      if (coin.website) constants.cache.COIN_LINKS[coinId].website = coin.website;
    }
    if (skippedCount > 0) {
       logger.warn(`[Uptos Pump] Skipped ${skippedCount} coins due to missing address.`);
    }
    
    // Filter logic adjusted slightly to ensure it only includes Uptos Pump coins
    const UptosCoinArray = uptosPumpCoinList.map(c => constants.cache.COINS[c.addr]).filter(Boolean); 
    const UptosCoinScoresArray = uptosPumpCoinList.map(c => constants.cache.COIN_SCORE[c.addr]).filter(Boolean);
    const UptosCoinLinksArray = uptosPumpCoinList.map(c => constants.cache.COIN_LINKS[c.addr]).filter(Boolean);
    const UptosCoinMetricsArray = uptosPumpCoinList.map(c => constants.cache.COIN_METRICS[c.addr]).filter(Boolean);
    
    if (UptosCoinArray.length > 0) {
      logger.info(`[Uptos Pump] Prepared ${UptosCoinArray.length} coin records for database update.`);
      await methods.coins.addMultipleCoinsOrUpdate(UptosCoinArray);
      logger.info(`[Uptos Pump] Inserted/Updated ${UptosCoinArray.length} coins.`);
      await Promise.all([
        methods.coinLinks.addMultipleCoinLinksOrUpdate(UptosCoinLinksArray),
        methods.coinScores.addMultipleCoinScoresOrUpdate(UptosCoinScoresArray),
        methods.coinMetrics.addMultipleCoinMetricsDataOrUpdate(UptosCoinMetricsArray),
      ]);
       logger.info(`[Uptos Pump] Inserted/Updated related links, scores, and metrics.`);
    }
    
    logger.info("[Uptos Pump] Finished Uptos Pump coin list processing.");
  } catch (error) {
    logger.error(`[Uptos Pump] Error processing Uptos Pump coin list:`, error);
  }

  logger.info("Starting to gather API data for all tokens in EmojiCoin tickers");

  try {
    const emojiCoinTickersResponse = await emojiCoinService.getAllEmojiCoinTickers(500);
    const emojiCoinTickers = emojiCoinTickersResponse.tickers;
    
    logger.info("[EmojiCoin] Starting EmojiCoin tickers processing...");
    if (emojiCoinTickers.length > 0) {
      logger.info(`[EmojiCoin] Fetched ${emojiCoinTickers.length} tickers from EmojiCoin API.`);
      
      // Process emoji tickers to get market IDs
      const processedTickers = await emojiCoinService.processEmojiCoinMarketIds(emojiCoinTickers);
      logger.info(`[EmojiCoin] Processed market IDs for ${processedTickers.length} tickers.`);
      
      // Update the emojicoin-complete-market-data.json file with coin addresses
      await emojiCoinService.updateMarketDataWithAddresses(emojiCoinTickers);
      logger.info(`[EmojiCoin] Updated market data JSON with coin addresses.`);
      
      let skippedEmojiCount = 0;
      for (const ticker of processedTickers) {
        const coinId = ticker.ticker_id;
        
        if (!coinId) {
          logger.warn(`[EmojiCoin] Skipping ticker with missing ID.`);
          skippedEmojiCount++;
          continue;
        }
        
        // Initialize cache objects if they don't exist
        if (!constants.cache.COINS[coinId]) {
          constants.cache.COINS[coinId] = {} as ICoin;
        }
        if (!constants.cache.COIN_SCORE[coinId]) {
          constants.cache.COIN_SCORE[coinId] = {} as ICoinScore;
        }
        if (!constants.cache.COIN_METRICS[coinId]) {
          constants.cache.COIN_METRICS[coinId] = {} as ICoinMetrics;
        }
        
        // Parse numeric values
        let lastPrice = 0, baseVolume = 0, targetVolume = 0, liquidityInUsd = 0;
        try {
             lastPrice = parseFloat(ticker.last_price);
             baseVolume = parseFloat(ticker.base_volume);
             targetVolume = parseFloat(ticker.target_volume);
             liquidityInUsd = parseFloat(ticker.liquidity_in_usd);
             if (isNaN(lastPrice) || isNaN(baseVolume) || isNaN(targetVolume) || isNaN(liquidityInUsd)) {
                 logger.warn(`[EmojiCoin] Invalid numeric data for ticker ${coinId}. Skipping metrics update.`);
                 // Reset potentially NaN values
                 lastPrice = 0; baseVolume = 0; targetVolume = 0; liquidityInUsd = 0;
             }
        } catch (parseError) {
             logger.error(`[EmojiCoin] Error parsing numeric data for ticker ${coinId}:`, parseError);
             // Reset potentially NaN values
             lastPrice = 0; baseVolume = 0; targetVolume = 0; liquidityInUsd = 0;
        }
       
        // Update coin data
        constants.cache.COINS[coinId].coin_id = coinId;
        constants.cache.COINS[coinId].coin_type_legacy = ticker.base_currency;
        constants.cache.COINS[coinId].coin_symbol = ticker.pool_id; 
        constants.cache.COINS[coinId].coin_name = `EmojiCoin ${ticker.pool_id}`;
        constants.cache.COINS[coinId].coin_decimals = 8; // Default for Aptos coins if not specified
        
        // Calculate is_graduated based on last_price field
        constants.cache.COINS[coinId].is_graduated = lastPrice >= 0.000100297 ? 'true' : 'false';
        
        // Calculate bonding curve progress
        const maxPrice = 0.000100297;
        const progress = lastPrice >= maxPrice ? 100 : (lastPrice / maxPrice) * 100;
        constants.cache.COINS[coinId].bonding_curve_progress = Math.round(progress); 
        
        // Add market ID and market cap from processed data
        if ('market_id' in ticker) {
          constants.cache.COINS[coinId].market_id = ticker.market_id as string;
        }
        
        if ('market_cap_usd' in ticker) {
          constants.cache.COINS[coinId].market_cap_usd = ticker.market_cap_usd as number;
        }
        
        // Update coin score data
        constants.cache.COIN_SCORE[coinId].coin_id = coinId;
        
        // Update coin metrics data
        constants.cache.COIN_METRICS[coinId].coin_id = coinId;
        constants.cache.COIN_METRICS[coinId].price_usd = lastPrice;
        constants.cache.COIN_METRICS[coinId].volume_24hr = targetVolume;
        constants.cache.COIN_METRICS[coinId].tvl = liquidityInUsd;
        constants.cache.COIN_METRICS[coinId].infinite_supply = false; // Default value
      }
      if (skippedEmojiCount > 0) {
          logger.warn(`[EmojiCoin] Skipped ${skippedEmojiCount} tickers due to missing ID.`);
      }
      
      // Filter based on processed tickers to ensure we only try to insert valid ones
      const EmojiCoinArray = processedTickers.map(t => constants.cache.COINS[t.ticker_id]).filter(Boolean); 
      const EmojiCoinScoresArray = processedTickers.map(t => constants.cache.COIN_SCORE[t.ticker_id]).filter(Boolean);
      const EmojiCoinMetricsArray = processedTickers.map(t => constants.cache.COIN_METRICS[t.ticker_id]).filter(Boolean);
      
      if (EmojiCoinArray.length > 0) {
        logger.info(`[EmojiCoin] Prepared ${EmojiCoinArray.length} coin records for database update.`);
        await methods.coins.addMultipleCoinsOrUpdate(EmojiCoinArray);
        logger.info(`[EmojiCoin] Inserted/Updated ${EmojiCoinArray.length} coins.`);
        await Promise.all([
          methods.coinScores.addMultipleCoinScoresOrUpdate(EmojiCoinScoresArray),
          methods.coinMetrics.addMultipleCoinMetricsDataOrUpdate(EmojiCoinMetricsArray),
        ]);
        logger.info(`[EmojiCoin] Inserted/Updated related scores and metrics.`);
      } else {
        logger.info("[EmojiCoin] No valid EmojiCoin data prepared for database update.");
      }
    } else {
      logger.info("[EmojiCoin] No tickers data retrieved from EmojiCoin API.");
    }
  } catch (error) {
    logger.error(`[EmojiCoin] Error processing EmojiCoin tickers:`, error);
  }
  logger.info("[Data Aggregation] Finished data aggregation process.");
};

export default { InsertOrUpdateDataFromCoinLists };