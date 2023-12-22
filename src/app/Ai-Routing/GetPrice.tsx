// import { BLOCKCHAIN_NAME, PriceToken } from "rubic-sdk";
// import configuration from "../rubic";
// import { SDK } from "rubic-sdk";
// import Moralis from "moralis";
// import { ethers } from "ethers";
// type MyBlockchainName = "ETHEREUM" | "POLYGON" | "AVALANCHE" | "SOLANA";

// // const DECIMAL_FACTOR = ethers.constants.WeiPerEther;

// async function CalculateTokenPrice(
//   address: string,
//   blockchain: MyBlockchainName
// ) {
//   try {
//     if (blockchain === "SOLANA") {
//       await Moralis.start({
//         apiKey:
//           "KYAJvxWLmqjf5BB0wUFN0EFpv8T9VjC6nvr6qIpsqYb0ArP466BrtOxxhqfLI9qi",
//       });
//       const response = await Moralis.SolApi.token.getTokenPrice({
//         network: "mainnet",
//         address: address,
//       });
//       const usdPriceString = response.raw.usdPrice.toString(); 
//       const weiValue = ethers.utils.parseEther(usdPriceString); 
//       console.log(weiValue);
//       return weiValue;
//     } else {
//       const sdk = await SDK.createSDK(configuration);
//       const token = await PriceToken.createToken({
//         blockchain: BLOCKCHAIN_NAME[blockchain],
//         address,
//       });
//       console.log(token.price);
//       const valueinwei = ethers.utils.parseEther(token.price);  
//       console.log(valueinwei);
//       return valueinwei;
//     }
//   } catch (error) {
//     console.error("Error in fetching token price:", error);
//   }
// }

// export default CalculateTokenPrice;
