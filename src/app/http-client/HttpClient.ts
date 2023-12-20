// HttpClient.ts
import axios, { AxiosInstance } from 'axios';

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL: baseURL,
    });
  }

  get<T>(url: string, params?: object): Promise<T> {
    return this.client.get<T>(url, { params }).then(response => response.data);
  }

}
