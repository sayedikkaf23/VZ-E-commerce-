import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  url = environment.apiUrl;

  constructor( private http: HttpClient) {}

  // Method to upload form data
  adminLogin(data: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.url}/user/login`, data); // Sending email and password as JSON
  }
  getUserDetails(): Observable<any> {
    return this.http.get(`${this.url}/user/submissions`); // GET request to fetch submissions
  }
}
