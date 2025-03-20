import constants from '../../constants';

const GRAPHQL_QUERIES = {
  GetFungibleAssetMetadata: `
    query GetFungibleAssetMetadata($assetType: String!) {
      fungible_asset_metadata(
        where: {asset_type: {_eq: $assetType}}
      ) {
        name
        symbol
        # Add other properties as needed
      }
    }
  `
};

const BASE_URL = "https://indexer.mainnet.aptoslabs.com/v1/graphql";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface CoinInfo {
  symbol: string;
  name: string;
  decimals: number;
  coin_type_hash: string;
  coin_type: string;
  creator_address: string;
}

interface CoinInfoResponse {
  coin_infos: CoinInfo[];
}

const fetchGraphQL = async <T>(
  operationsDoc: string, 
  operationName: string, 
  variables: Record<string, any> = {}
): Promise<GraphQLResponse<T>> => {
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

const getCoinDetailsOperationsDoc = (tokenName: string): string => {
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

const fetchMyQuery = (tokenName: string): Promise<GraphQLResponse<CoinInfoResponse>> => {
  const operationsDoc = getCoinDetailsOperationsDoc(tokenName);
  return fetchGraphQL<CoinInfoResponse>(operationsDoc, "MyQuery", {});
};

interface FungibleAssetMetadata {
  name: string;
  symbol: string;
  // Add other properties as needed
}

interface FungibleAssetMetadataResponse {
  fungible_asset_metadata: FungibleAssetMetadata[];
}

const getFungibleAssetMetadata = async (tokenName: string): Promise<FungibleAssetMetadata> => {
  const query = GRAPHQL_QUERIES.GetFungibleAssetMetadata;
  
  if (!query) {
    throw new Error("GetFungibleAssetMetadata query is not defined");
  }
  
  const { errors, data } = await fetchGraphQL<FungibleAssetMetadataResponse>(
    query,
    "GetFungibleAssetMetadata",
    { assetType: tokenName }
  );
  
  if (errors) {
    throw new Error(errors[0].message);
  }
  
  if (!data || !data.fungible_asset_metadata[0]) {
    throw new Error("No fungible asset metadata found");
  }
  
  return data.fungible_asset_metadata[0];
};

export default getCoinDetailsOperationsDoc;
export { fetchMyQuery, getFungibleAssetMetadata };