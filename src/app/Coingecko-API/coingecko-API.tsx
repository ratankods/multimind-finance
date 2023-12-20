// CoingeckoApi.ts
import { HttpClient } from "../http-client/HttpClient";

interface CoingeckoResponse {
  [key: string]: {
    [currency: string]: number;
  };
}

interface CoinGeckoTokenListResponse {
  id: string;
  platforms: { [key: string]: string | null };
}

interface Token {
  id: string;
}

export class CoingeckoApi {
  private httpClient: HttpClient;
  private baseUrl: string = "https://api.coingecko.com/api/v3/";

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async getPriceForToken(tokenId: string, currency: string): Promise<any> {
    const response = await this.httpClient.get<CoingeckoResponse>(
      `${this.baseUrl}simple/price`,
      {
        ids: tokenId,
        vs_currencies: currency,
      }
    );
    return response;
  }

  async getTokensByBlockchain(blockchainId: string): Promise<Token[]> {
    const response: CoinGeckoTokenListResponse[] = await this.httpClient.get(
      `${this.baseUrl}coins/list?include_platform=true`
    );
    return response.filter(
      (token: CoinGeckoTokenListResponse) =>
        token.platforms[blockchainId] !== undefined
    );
  }
  async getNativeTokenPriceInUSD(tokenId: string): Promise<number> {
    const nativeTokenPriceInUSD = await this.getPriceForToken(tokenId, "usd");
    return nativeTokenPriceInUSD;
  }

  async convertTokenValue(fromTokenId: string): Promise<number> {
    const fromTokenPriceInUSD = await this.getPriceForToken(fromTokenId, "usd");
    return fromTokenPriceInUSD;
  }
}
