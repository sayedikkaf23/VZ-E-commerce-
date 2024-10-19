import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service'; // Import your service

@Component({
  selector: 'app-business-bank-account',
  templateUrl: './business-bank-account.component.html',
  styleUrl: './business-bank-account.component.css'
})
export class BusinessBankAccountComponent {

  userList: any[] = []; // To store the fetched user data

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserDetails(); // Call the method when the component loads
  }

  fetchUserDetails(): void {
    this.adminAuthService.getUserDetails().subscribe(
      (response) => {
        this.userList = response; // Assign the API response to the userList array
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }
}

