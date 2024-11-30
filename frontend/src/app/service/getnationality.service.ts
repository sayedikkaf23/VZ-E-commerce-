import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class GetnationalityService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getNationality(): Observable<any> {
    return this.http.get(`${this.url}/nationalities/get-nationalities`); // GET request to fetch all services
  }
  getCountries(): Observable<any> {
    return this.http.get(`${this.url}/nationalities/getCountries`); // GET request to fetch all services
  }
}
