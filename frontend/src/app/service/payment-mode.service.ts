import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PaymentModeService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPaymentModes(page = 1, limit = '') {
    return this.http.get(
      `${this.url}/online/get_payment_modes?page=${page}&limit=${limit}`
    );
  }

  addPaymentMode(payload: any) {
    return this.http.post(`${this.url}/online/add_payment_mode`, payload);
  }

  updatePaymentModeStatus(payload: any) {
    return this.http.patch(
      `${this.url}/online/update_payment_mode_status`,
      payload
    );
  }

  searchPaymentMode(payload: any) {
    return this.http.post(`${this.url}/online/search_payment_mode`, payload);
  }
}
