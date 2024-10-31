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


  getVirtaulData(): Observable<any> {
    return this.http.get(`${this.url}/mail/getMailDetails`); // GET request to fetch all services
  }


}
