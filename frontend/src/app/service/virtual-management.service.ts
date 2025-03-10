import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class VirtualManagementService {

  url = environment.apiUrl;

  constructor( private http: HttpClient) {}


  getVirtaulData(page: number, limit: number): Observable<any> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<any>(`${this.url}/virtual/getVirtualDetails`, { params });
    // Adjust URL/path as needed for your Node route
  }
 
  callSalesforceEndpoint(payload:any): Observable<any> {
    return this.http.post(`${this.url}/virtual/callSalesforceEndpoint`, payload); // Sending the payload to the backend
  }

  checkStatus(data: { CustomerId: string; CompanyName: string }): Observable<any> {
    return this.http.post(`${this.url}/user/checkStatus`, data); // POST request to check status
  }
}
