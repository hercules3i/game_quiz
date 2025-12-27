import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import Web3 from 'web3';
import CoinbaseWalletSdk from '@coinbase/wallet-sdk';
import { ServiceService } from "./service.service";

@Injectable({
  providedIn: 'root'
})
export class CoinbaseWalletService {
  private chargeUrl = 'https://api.commerce.coinbase.com/charges';

  private coinbaseWallet = new CoinbaseWalletSdk({ appName: 'Metalearn' });
  private ethereum = this.coinbaseWallet.makeWeb3Provider();
  private web3 = new Web3(this.ethereum);

  constructor(
    private http: HttpClient,
  ) {}

  async generateCharge(
    amount: string,
    currency: string,
    name = "New charge",
    description = "",
    metadata?: any,
  ) {
    const requestBody = {
      local_price: {
        amount,
        currency,
      },
      pricing_type: 'fixed_price',

      name,
      description,
      metadata,
    };

    const headers = new HttpHeaders()
      .append('Accept', 'application/json')
      .append('Content-Type', 'application/json')
      .append('X-CC-Api-Key', environment.coinbase.commerceApiKey);

    this.http.post(
      this.chargeUrl,
      requestBody,
      { headers },
    ).subscribe(res => {
      console.log(res);
    });
  }

  async getEthereumAccounts(): Promise<string[]> {
    const res = await this.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const accounts = res as string[];
    return accounts;
  }
}
