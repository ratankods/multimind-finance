import { BLOCKCHAIN_NAME, EvmCrossChainTrade } from 'rubic-sdk';
import configuration from '../rubic';
import { SDK } from 'rubic-sdk';

async function calculateCrossChainTrades(fromBlockchain: any , fromTokenAddress: any, toBlockchain: any, toTokenAddress: any, fromAmount: any) {
    let sdk;
    try {
        sdk = await SDK.createSDK(configuration);
        const wrappedTrades = await sdk.crossChainManager.calculateTrade(
            { blockchain: fromBlockchain, address: fromTokenAddress },
            fromAmount,
            { blockchain: toBlockchain, address: toTokenAddress }
        );
        const providerArray:any = []

        // console.log(wrappedTrades);
        wrappedTrades.forEach(wrappedTrade => {
            if (wrappedTrade.error) {
                console.error(`error: ${wrappedTrade.error}`);
            } else {
                debugger
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
