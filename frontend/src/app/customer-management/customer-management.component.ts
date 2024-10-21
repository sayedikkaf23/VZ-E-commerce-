import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service'; 
@Component({
  selector: 'app-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrl: './customer-management.component.css'
})
export class CustomerManagementComponent {
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

