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
  getServices(): Observable<any> {
    return this.http.get(`${this.url}/user/services`); // GET request to fetch user services
  }
  updateService(serviceId: string, serviceData: any, file: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('serviceName', serviceData.serviceName);
    formData.append('description', serviceData.description);
    formData.append('isActive', serviceData.isActive.toString()); // Convert boolean to string
  
    if (file) {
      formData.append('icon', file); // Append the file if provided
    }
  
    return this.http.put(`${this.url}/user/services/${serviceId}`, formData); // PUT request to update the service
  }
  deleteService(serviceId: string): Observable<any> {
    return this.http.delete(`${this.url}/user/services/${serviceId}`); // DELETE request to remove the service
  }
  
}

