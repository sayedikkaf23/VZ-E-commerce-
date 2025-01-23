import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumenttypeService {
  private url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Personal Bank
  getPersonalBanks(): Observable<any> {
    return this.http.get(`${this.url}/documentype/personal-bank`);
  }
  createPersonalBank(data: any): Observable<any> {
    return this.http.post(`${this.url}/documentype/personal-bank`, data);
  }

  // Business Bank
  getBusinessBanks(): Observable<any> {
    return this.http.get(`${this.url}/documentype/business-bank`);
  }
  createBusinessBank(data: any): Observable<any> {
    return this.http.post(`${this.url}/documentype/business-bank`, data);
  }

  // Virtual Reception
  getVirtualReceptions(): Observable<any> {
    return this.http.get(`${this.url}/documentype/virtual-reception`);
  }
  createVirtualReception(data: any): Observable<any> {
    return this.http.post(`${this.url}/documentype/virtual-reception`, data);
  }

  // Mail Management
  getMailManagements(): Observable<any> {
    return this.http.get(`${this.url}/documentype/mail-management`);
  }
  createMailManagement(data: any): Observable<any> {
    return this.http.post(`${this.url}/documentype/mail-management`, data);
  }
}
