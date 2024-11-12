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


  getVirtaulData(): Observable<any> {
    return this.http.get(`${this.url}/virtual/getVirtualDetails`); // GET request to fetch all services
  }
  callSalesforceEndpoint(payload:any): Observable<any> {
    return this.http.post(`${this.url}/virtual/callSalesforceEndpoint`, payload); // Sending the payload to the backend
  }

}
