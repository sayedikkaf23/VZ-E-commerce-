import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service'; 
@Component({
  selector: 'app-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrl: './customer-management.component.css'
})
export class CustomerManagementComponent {
  userList: any[] = []; // To store the fetched user data

  selectedCustomer: { [key: string]: any } | null = null;

  showDetailsModal: boolean = false;

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

  openDetailsModal(details: any): void {
    this.selectedCustomer = details; // Assign selected customer details
    this.showDetailsModal = true; // Open the modal for customer
  }

  // Helper function to get keys of an object
  objectKeys(obj: { [key: string]: any } | null): string[] {
    return obj ? Object.keys(obj) : []; // Return object keys or empty array if null
  }

  // Helper function to check if a value is an object
  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false; // Close the modal
  }
  
}

