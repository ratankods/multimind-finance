import { HttpClient } from '../http-client/HttpClient';
import { ethers } from 'ethers';

  
export class GasPriceApi {
  private httpClient: HttpClient;
  private baseUrl: string; 

  constructor(httpClient: HttpClient, baseUrl: string) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
  }

  async getEvmGasPrice(blockchain: string): Promise<number> {
    try {
      // Try fetching from 1inch API
      const oneInchPrice = await this.fetchFromOneInch();
      if (oneInchPrice) return oneInchPrice;
    } catch (error) {
      console.error("1inch API error:", error);
    }

    // Fallback to Web3 service
    try {
      const web3Price = await this.fetchFromWeb3(blockchain);
      return web3Price;
    } catch (error) {
      console.error("Web3 service error:", error);
      throw new Error("Failed to fetch gas price");
    }
  }

  
private async fetchFromOneInch(): Promise<number> {
    const Response = await this.httpClient.get<{ fast: number }>(`https://gas-price-api.1inch.io/v1.2/1`);
    return Response.fast;
  }


  private async fetchFromWeb3(blockchain: string): Promise<number> {
    let rpcUrl = '';
    switch (blockchain) {
      case 'ethereum':
        rpcUrl = 'https://eth-mainnet.g.alchemy.com/v2/R0XpsJFtNE8vdpN3eZpRfWh5TzBfFFsU';
        break;
      case 'polygon':
        rpcUrl = 'https://polygon-mainnet.g.alchemy.com/v2/6mwmXKoYNk2dqMEqePtoptLbRDaIhQyP';
        break;
      case 'arbitrum':
        rpcUrl = 'https://arb-mainnet.g.alchemy.com/v2/aSfnUj8zFx38R31he8icFmBHPa_tl_ca';
        break;
      case 'optimism':
        rpcUrl = 'https://opt-mainnet.g.alchemy.com/v2/wfELaT_vmriA39wmXvoeXoEEjtN6WbnC';
        break;
      default:
        throw new Error(`Blockchain '${blockchain}' not supported`);
    }
  
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const gasPrice = await provider.getGasPrice();
    return gasPrice.toNumber();
  }
  

}
