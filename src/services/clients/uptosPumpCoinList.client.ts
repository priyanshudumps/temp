const fetchUptosPumpCoinList = async () => {
  let page = 1;
  const pageSize = 45;
  let totalPages = 1;
  let allCoins = [];

  try {
    // First request to get total count and first page of data
    const initialUrl = `https://pump.uptos.xyz/token/api?page=${page}&pageSize=${pageSize}&keyword=&orderField=virtual_aptos_reserves&orderBy=desc`;
    const initialResponse = await fetch(initialUrl);
    
    if (!initialResponse.ok) {
      throw new Error(`API request failed with status ${initialResponse.status}`);
    }
    
    const initialData = await initialResponse.json();
    
    // The second item in the array is the total count of coins
    const totalCoins = initialData[1];
    // Calculate total pages needed
    totalPages = Math.ceil(totalCoins / pageSize);
    
    // Add first page of coins to our result
    allCoins = [...initialData[0]];
    
    // Fetch remaining pages
    for (page = 2; page <= totalPages; page++) {
      console.log(`Fetching page ${page} of ${totalPages}`);
      const url = `https://pump.uptos.xyz/token/api?page=${page}&pageSize=${pageSize}&keyword=&orderField=virtual_aptos_reserves&orderBy=desc`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      // Add this page's coins to our result
      allCoins = [...allCoins, ...data[0]];
    }
    
    console.log(`Successfully fetched ${allCoins.length} coins out of ${totalCoins} total`);
    console.log(allCoins.length);
    return allCoins;
    
  } catch (error) {
    console.error("Error fetching coin list:", error);
    throw error;
  }
};

export default fetchUptosPumpCoinList;