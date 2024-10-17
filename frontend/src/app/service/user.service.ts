import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class UserService {  // Changed the service name to UserService
  url = environment.apiUrl;

  constructor( private http: HttpClient) {}

  // Method to upload form data
  uploadUserData(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}/user/submit`, formData); // Combining base URL with endpoint
  }
  payNowByStripe(payload: any): Observable<any> {
    return this.http.post(`${this.url}/user/payNowByStripe`, payload); // Combining base URL with endpoint
  }
  checkUser(payload: { email: string, mobileNumber: string }): Observable<any> {
    return this.http.post(`${this.url}/user/checkUser`, payload); // Sending the payload to the backend
  }
  

  getServices(): Observable<any> {
    return this.http.get(`${this.url}/user/services`); // GET request to fetch all services
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.url}/user/login`, { email, password }); // Sending email and password for login
  }
}
