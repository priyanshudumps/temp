const fetchHippoTokenList = async () => {
    const url = 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/src/defaultList.mainnet.json';
    const response = await fetch(url);
    return response.json();
}
module.exports = fetchHippoTokenList