import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CashDepositCustomerService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCashDeposits(page = 1, limit = '') {
    return this.http.get(
      `${this.url}/admin/get_cash_deposit?page=${page}&limit=${limit}`
    );
  }
}