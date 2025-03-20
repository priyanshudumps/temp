

const fetchPanoraCoinList = async ()=> {
  const url =
    "https://raw.githubusercontent.com/PanoraExchange/Aptos-Tokens/main/token-list.json";
  const response = await fetch(url);
  return response.json();
};

export default fetchPanoraCoinList;