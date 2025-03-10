import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class MailManagementService {

  url = environment.apiUrl;

  constructor( private http: HttpClient) {}

  getVirtualData(page: number, limit: number): Observable<any> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<any>(`${this.url}/mail/getMailDetails`, { params });
    // or whatever your actual endpoint is
  }
 

  callSalesforceEndpoint(payload:any): Observable<any> {
    return this.http.post(`${this.url}/mail/callSalesforceEndpoint`, payload); // Sending the payload to the backend
  }

  checkStatus(data: { CustomerId: string; CompanyName: string }): Observable<any> {
    return this.http.post(`${this.url}/user/checkStatus`, data); // POST request to check status
  }

}
