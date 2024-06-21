const constants = require("../../constants");

const BASE_URL = "https://indexer.mainnet.aptoslabs.com/v1/graphql";
const fetchGraphQL = async (operationsDoc, operationName, variables) => {
  const result = await fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
  });

  return await result.json();
};

const getCoinDetailsOperationsDoc = (tokenName) => {
  return `
        query MyQuery {
            coin_infos(
                where: {coin_type: {_eq: "${tokenName}"}}
            ) {
                symbol
                name
                decimals
                coin_type_hash
                coin_type
                creator_address
            }
        }
    `;
};

const fetchMyQuery = (tokenName) => {
  const operationsDoc = getCoinDetailsOperationsDoc(tokenName);
  return fetchGraphQL(operationsDoc, "MyQuery", {});
};

const getFungibleAssetMetadata = async (tokenName) => {
  const { errors, data } = await fetchGraphQL(
    constants.graphql.QUERIES.GetFungibleAssetMetadata,
    "GetFungibleAssetMetadata",
    { assetType: tokenName }
  );
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data.fungible_asset_metadata[0];
};

module.exports = getCoinDetailsOperationsDoc;
