import { HttpClient } from '../http-client/HttpClient';
import { CoingeckoApi } from '../Coingecko-API/coingecko-API';
import { GasPriceApi } from '../Gas-Price-API/gas-Price-API'; 
import { DexAggregator } from '../Ai-Routing/ProviderList'; 

// Initialize the HTTP client
const httpClient = new HttpClient('http://localhost:3000');

// Create the services
const coingeckoApi = new CoingeckoApi(httpClient);
const dexAggregator = new DexAggregator(httpClient, 'https://example.com'); 

// Test getTokensByBlockchain
export async function testGetTokensByBlockchain(value : string) {
  try {
    const tokens = await coingeckoApi.getTokensByBlockchain(value); 
    console.log('Tokens:', tokens);
    return tokens
  } catch (error) {
    console.error("Error fetching tokens:", error);
  }
}

// Test getPriceForToken
export async function testGetPriceForToken() {
  try {
    const price = await coingeckoApi.getPriceForToken('bitcoin', 'usd'); 
    console.log('Price:', price);
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

// Test getNativeTokenPriceInUSD
export async function testGetNativeTokenPriceInUSD() {
  try {
    const price = await coingeckoApi.getNativeTokenPriceInUSD('ethereum'); // Replace 'ethereum' with your desired token
    console.log('Native Token Price in USD:', price);
  } catch (error) {
    console.error("Error fetching native token price in USD:", error);
  }
}

// Test fetchDeals
export async function testFetchDeals() {
  try {
    const deals = await dexAggregator.fetchDeals('token1', 'token2', 100); // Replace 'token1', 'token2', 100 with your desired tokens and amount
    console.log('Deals:', deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
  }
}

// Call the test functions
// testGetTokensByBlockchain();
// testGetPriceForToken();
// testGetNativeTokenPriceInUSD();
// testFetchDeals();
