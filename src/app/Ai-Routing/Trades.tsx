import { BLOCKCHAIN_NAME, EvmCrossChainTrade } from 'rubic-sdk';
import configuration from '../rubic';
import { SDK } from 'rubic-sdk';

type MyBlockchainName = 'ETHEREUM' | 'POLYGON'  | 'AVALANCHE' | 'SOLANA';

async function calculateCrossChainTrades(fromBlockchain: MyBlockchainName , fromTokenAddress: any, toBlockchain: MyBlockchainName, toTokenAddress: any, fromAmount: any) {
    let sdk;
    try {
        debugger;
        sdk = await SDK.createSDK(configuration);
        const wrappedTrades = await sdk.crossChainManager.calculateTrade(
            { blockchain: BLOCKCHAIN_NAME[fromBlockchain], address: fromTokenAddress },
            fromAmount,
            { blockchain: BLOCKCHAIN_NAME[toBlockchain], address: toTokenAddress }
        );
        const providerArray:any = []

        // console.log(wrappedTrades);
        wrappedTrades.forEach(wrappedTrade => {
            if (wrappedTrade.error) {
                console.error(`error: ${wrappedTrade.error}`);
            } else {
                const providerObj:any = {}
                providerObj.dexName = wrappedTrade?.tradeType;
                providerObj.protocolFee = wrappedTrade?.trade?.feeInfo?.rubicProxy?.fixedFee?.amount?.toFormat(3);
                providerObj.tokenSymbol = wrappedTrade?.trade?.to?.symbol; 
                providerObj.tokenAmount = wrappedTrade?.trade?.to?.tokenAmount?.toFormat(3);
                providerObj.estimatedTime = "Unavailable"; 
                providerObj.tokenUriLink = "Unavailable"; 
                providerArray.push(providerObj);
            }

        });

        console.log(providerArray);
        return providerArray;
        
    } catch (error) {
        console.error("Error in Rubic SDK operation:", error);
    }
}

export default calculateCrossChainTrades;
