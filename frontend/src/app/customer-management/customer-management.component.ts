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
  searchTerm: string = '';  
  filteredUserList: any[] = []; // Filtered user data
 

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserDetails(); // Call the method when the component loads
  }

  fetchUserDetails(): void {
    this.adminAuthService.getUserDetails().subscribe(
      (response) => {
        this.userList = response; 
        this.filteredUserList = [...this.userList]; // Initialize filtered list
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

  onSearch() {
    this.searchTerm = this.searchTerm.trim();
  
    if (this.searchTerm) {
      this.filteredUserList = this.userList.filter(user =>
        (`${user?.firstName || ''} ${user?.lastName || ''}`).trim().includes(this.searchTerm) ||
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.nationality.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.birthday.includes(this.searchTerm) // Direct match for dates
      );
    } else {
      this.filteredUserList = [...this.userList];// Reset to full list if search is empty
    }
  }

  
  
}

