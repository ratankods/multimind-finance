import { HttpClient } from '../http-client/HttpClient';

export interface DexDeal {
  sourceTokenPrice: number;
  sourceTokenAmount: number;
  destinationToken: string;
  destinationTokenAmount: number;
  protocolFee: number;
  estimatedTime: number;
  destinationTokenDollarAmount: number;
}

export class DexAggregator {
  private httpClient: HttpClient;
  private baseUrl: string; 

  constructor(httpClient: HttpClient, baseUrl: string) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
  }

  async fetchDeals(token1: string, token2: string, amount: number): Promise<DexDeal[]> {
    const deals: DexDeal[] = [];

    const dexUrls = [
      'https://uniswap.org/api',
      'https://sushiswap.org/api',
    ];

    for (const dexUrl of dexUrls) {
      try {
        const response = await this.httpClient.get<DexDeal[]>(`${dexUrl}/deals`, {
          params: { token1, token2, amount },
        });
        deals.push(...response);
      } catch (error) {
        console.error(`Error fetching deals from ${dexUrl}:`, error);
      }
    }

    return deals.sort((a, b) => b.destinationTokenDollarAmount - a.destinationTokenDollarAmount).slice(0, 4);
  }
}
