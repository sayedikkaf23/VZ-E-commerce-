import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/user/submit'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  submitUserDetails(userDetails: any): Observable<any> {
    // This method sends the user details to the backend
    return this.http.post<any>(this.apiUrl, userDetails);
  }
}
