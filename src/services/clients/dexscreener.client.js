const BASE_URL = "https://api.dexscreener.com";
const Big = require("big.js");

const fetchCoinDetailsFromAddress = async (address) => {
  const endpoint = `latest/dex/tokens/${address}`;
  const url = `${BASE_URL}/${endpoint},`;
  try {
    const response = await fetch(url);
    return response.json();
  } catch (err) {
    console.log(err.message);
    return {
      schemaVersion: "1.0.0",
      pairs: [],
    };
  }
};

const fetchCoinDetailsfromAddressAndAggregateData = async (address) => {
  const responseSkeletom = {
    pairAddresses: [],
    address: "",
    name: "",
    symbol: "",
    price: 0,
    txns: {
      m5: {
        buys: 0,
        sells: 0,
      },
      h1: {
        buys: 0,
        sells: 0,
      },
      h6: {
        buys: 0,
        sells: 0,
      },
      h24: {
        buys: 0,
        sells: 0,
      },
    },
    volume: {
      h24: Big(0),
      h6: Big(0),
      h1: Big(0),
      m5: Big(0),
    },
    priceChange: {
      m5: Big(0),
      h1: Big(0),
      h6: Big(0),
      h24: Big(0),
    },
    liquidity: {
      // TODO: not sure if I should add all pools value for this ,
      // need to check if fdv is same even if the token is not the base token
      usd: 0,
      base: 0,
      quote: 0,
    },
    fdv: 0,
    // TODO: not sure if I should add all pools value for this ,
    // need to check if fdv is same even if the token is not the base token
  };
  let average_price_numenator = Big(0);
  let average_price_denominator = 0;
  let price_change_denominator = 0;
  let index = 0;
  const apiRes = await fetchCoinDetailsFromAddress(address);
  for (const pair of apiRes.pairs) {
    responseSkeletom.pairAddresses.push({
      dexscreenerId: pair.pairAddress,
      dex: pair.dexId,
      baseToken: pair.baseToken,
      quoteToken: pair.quoteToken,
      liquidity: pair.liquidity.usd,
      fdv: pair.fdv,
      createdAt: pair.pairCreatedAt,
    });

    // aggregate price
    if (
      address === pair.baseToken.address &&
      pair.priceUsd != undefined &&
      index <= 5
    ) {
      average_price_numenator = average_price_numenator.plus(
        Big(pair.priceUsd)
      );
      average_price_denominator += 1;
      if (index === 1) {
        responseSkeletom.address = pair.baseToken.address;
        responseSkeletom.name = pair.baseToken.name;
        responseSkeletom.symbol = pair.baseToken.symbol;
      }
    } else if (
      address === pair.quoteToken.address &&
      pair.priceNative != undefined &&
      index <= 5
    ) {
      average_price_numenator = average_price_numenator.plus(
        Big(pair.priceUsd / pair.priceNative)
      );
      average_price_denominator += 1;

      if (index === 1) {
        responseSkeletom.address = pair.quoteToken.address;
        responseSkeletom.name = pair.quoteToken.name;
        responseSkeletom.symbol = pair.quoteToken.symbol;
      }
    }

    // aggregate txns from all pools,
    // can change to only top 5 pools in future if needed
    if (pair.txns != undefined && index <= 5) {
      responseSkeletom.txns.m5.buys += pair.txns.m5.buys;
      responseSkeletom.txns.m5.sells += pair.txns.m5.sells;
      responseSkeletom.txns.h1.buys += pair.txns.h1.buys;
      responseSkeletom.txns.h1.sells += pair.txns.h1.sells;
      responseSkeletom.txns.h6.buys += pair.txns.h6.buys;
      responseSkeletom.txns.h6.sells += pair.txns.h6.sells;
      responseSkeletom.txns.h24.buys += pair.txns.h24.buys;
      responseSkeletom.txns.h24.sells += pair.txns.h24.sells;
    }

    // aggregate volume from all pools,
    // can change to only top 5 pools in future if needed
    if (pair.volume != undefined && index <= 5) {
      responseSkeletom.volume.h24 = responseSkeletom.volume.h24.plus(
        Big(pair.volume.h24)
      );
      responseSkeletom.volume.h6 = responseSkeletom.volume.h6.plus(
        Big(pair.volume.h6)
      );
      responseSkeletom.volume.h1 = responseSkeletom.volume.h1.plus(
        Big(pair.volume.h1)
      );
      responseSkeletom.volume.m5 = responseSkeletom.volume.m5.plus(
        Big(pair.volume.m5)
      );
    }

    // aggregate price change from all pools,
    // can change to only top 5 pools in future if needed
    if (pair.priceChange != undefined && index <= 5) {
      responseSkeletom.priceChange.m5 = responseSkeletom.priceChange.m5.plus(
        Big(pair.priceChange.m5)
      );
      responseSkeletom.priceChange.h1 = responseSkeletom.priceChange.h1.plus(
        Big(pair.priceChange.h1)
      );
      responseSkeletom.priceChange.h6 = responseSkeletom.priceChange.h6.plus(
        Big(pair.priceChange.h6)
      );
      responseSkeletom.priceChange.h24 = responseSkeletom.priceChange.h24.plus(
        Big(pair.priceChange.h24)
      );
      price_change_denominator += 1;
    }

    index += 1;
  }
  if (average_price_denominator > 0) {
    responseSkeletom.price = average_price_numenator.div(
      Big(average_price_denominator)
    );
  }

  if (price_change_denominator > 0) {
    responseSkeletom.priceChange.m5 = responseSkeletom.priceChange.m5.div(
      Big(price_change_denominator)
    );
    responseSkeletom.priceChange.h1 = responseSkeletom.priceChange.h1.div(
      Big(price_change_denominator)
    );
    responseSkeletom.priceChange.h6 = responseSkeletom.priceChange.h6.div(
      Big(price_change_denominator)
    );
    responseSkeletom.priceChange.h24 = responseSkeletom.priceChange.h24.div(
      Big(price_change_denominator)
    );
  }

  return responseSkeletom;
};

module.exports = {
  fetchCoinDetailsfromAddressAndAggregateData,
};
