

interface HippoCoinListResponse {
  name: string;
  timestamp: string;
  tokens: any;
}

const fetchHippoCoinList = async (): Promise<HippoCoinListResponse> => {
  const url =
    "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/src/defaultList.mainnet.json";
  const response = await fetch(url);
  return response.json();
};

export default fetchHippoCoinList;