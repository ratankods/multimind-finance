import { BLOCKCHAIN_NAME, EvmCrossChainTrade, PriceToken } from 'rubic-sdk';
import configuration from '../rubic';
import { SDK } from 'rubic-sdk';

// Define a custom type for your specific blockchains
type MyBlockchainName = 'ETHEREUM' | 'POLYGON' | 'OPTIMISM' | 'AVALANCHE';

async function CalculateTokenPrice(address: string, blockchain: MyBlockchainName) {
  try {
    const sdk = await SDK.createSDK(configuration);
    const token = await PriceToken.createToken({
      blockchain: BLOCKCHAIN_NAME[blockchain],
      address
    });
    const priceString = token.price.toString();
    console.log("Token Price:", priceString);
    return token.price;
  } catch (error) {
    console.error("Error in fetching token price:", error);
  }
}

export default CalculateTokenPrice;
