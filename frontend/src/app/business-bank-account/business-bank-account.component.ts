import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service'; // Import your service
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-business-bank-account',
  templateUrl: './business-bank-account.component.html',
  styleUrls: ['./business-bank-account.component.css']
})
export class BusinessBankAccountComponent implements OnInit {
  userList: any[] = []; // To store the fetched user data
  selectedUserShareholders: any[] = []; // To store selected user's shareholder details
  showModal: boolean = false; // Flag to control modal visibility
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;
  showFileModal: boolean = false; // New flag for file modal
  selectedAdditionalFiles: any[] = []; // Selected files for the modal
  isLoading: boolean = false; // Single loader state for all actions

  selectedUserFields: string[] = ['isMatched', 'caseId', 'customerId', 'highestScoringResult'];


  // Dummy data for shareholders
  dummyShareholders = [
    { name: 'John Doe', id: 'SH001', percentage: 25 },
    { name: 'Jane Smith', id: 'SH002', percentage: 35 },
    { name: 'Robert Wilson', id: 'SH003', percentage: 40 }
  ];
  loadingStatuses: { [key: string]: boolean } = {}; // To track loading state for each user


  selectedUser: { [key: string]: any } | null = null;

  showDetailsModal: boolean = false;

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserDetails(); // Call the method when the component loads
  }

  fetchUserDetails(): void {
    this.adminAuthService.getBusinessBank().subscribe(
      (response) => {
        this.userList = response; // Assign the API response to the userList array
        this.checkColumnData(); // Check columns only after data is loaded

      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  checkColumnData(): void {
    this.hasSalaryData = this.userList.some((user) => !!user.salary);
    this.hasCompanyNameData = this.userList.some((user) => !!user.companyname);
  }

  checkStatus(user: any): void {
    const payload = {
      CustomerId: user.LeadId,
      CompanyName: 'Virtuzone',
    };
  
    // Start the global loader
    this.isLoading = true;
  
    // console.log('Loading started');
  
    this.adminAuthService.checkStatus(payload).subscribe(
      (response) => {
        // Update user status with the response
        user.CustomerStatus = response.data?.CustomerStatus || 'Status not found';
        // console.log(`API response for user ${user.LeadId}:`, response);
      },
      (error) => {
        // Handle API error
        console.error(`API error for user ${user.LeadId}:`, error);
      },
      () => {
        // Stop the global loader after API call completes
        this.isLoading = false;
        // console.log('Loading ended');
      }
    );
  }
  
  
  
  
  
 openModal(shareholders: any[]): void {
  if (shareholders && shareholders.length > 0) {
    this.selectedUserShareholders = shareholders; // Assign the shareholders array directly
    this.showModal = true; // Open the modal
  } else {
    console.error("No shareholders found for this user.");
  }
}

closeModal(): void {
  this.showModal = false; // Close the modal
}

  openFileModal(files: any[]): void {
    if (files && files.length > 0) {
      this.selectedAdditionalFiles = files; // Assign the files to display in the modal
      this.showFileModal = true; // Open the modal
    } else {
      // console.log('No additional files to display.');
    }
  }
  
  closeFileModal(): void {
    this.showFileModal = false; // Close the modal
  }

  openDetailsModal(details: any): void {
    console.log('Selected User Data:', details);
    this.selectedUser= details; // Assign selected user details
    this.showDetailsModal = true; // Open the modal for user
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
