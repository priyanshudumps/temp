const BASE_URL = "https://api.geckoterminal.com/api/v2";
const HEADERS = {
  Accept: "application/json;version=20230302",
};

interface TokenData {
  id: string;
  type: string;
  attributes: {
    address: string;
    name: string;
    symbol: string;
    // Add other attributes as needed
  };
  relationships?: Record<string, any>;
}

interface GeckoTerminalResponse {
  data: TokenData[];
  included?: any[];
  meta?: Record<string, any>;
}

export const fetchCoinDetailsByAddresses = async (addresses: string[]): Promise<GeckoTerminalResponse> => {
  const params = {
    network: "aptos",
    addresses: addresses.join(","),
  };
  const url = `${BASE_URL}/tokens/multi`;
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`${url}?${searchParams}`, { headers: HEADERS });
  return response.json();
};

export default {
  fetchCoinDetailsByAddresses,
};