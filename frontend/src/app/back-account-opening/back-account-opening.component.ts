import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-back-account-opening',
  templateUrl: './back-account-opening.component.html',
  styleUrls: ['./back-account-opening.component.css'],
})
export class BackAccountOpeningComponent implements OnInit {

  userList: any[] = []; // To store the fetched user data
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;
  loadingStatuses: { [key: string]: boolean } = {}; // To track loading state for each user
  selectedAdditionalFiles: any[] = []; // To store the additional files for the modal
  showFileModal: boolean = false; // Control the visibility of the modal

  selectedUser: { [key: string]: any } | null = null;

  showDetailsModal: boolean = false;
  searchTerm: string = '';  
  filteredUserList: any[] = []; // Filtered user data
  
  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserDetails(); // Call the method when the component loads
  }

  fetchUserDetails(): void {
    this.adminAuthService.getPersonalBank().subscribe(
      (response) => {
        this.userList = response; // Assign the API response to the userList array
        this.filteredUserList = [...this.userList];
        this.checkColumnData(); // Check columns only after data is loaded
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  checkColumnData(): void {
    this.hasSalaryData = this.userList.some((user) => !!user.userDetails?.salary);
    this.hasCompanyNameData = this.userList.some((user) => !!user.userDetails?.companyname);
  }

  isLoading: boolean = false; // Global loading state

  checkStatus(user: any): void {
    // Validate that user and LeadId exist
    if (!user || !user.leadWithDetails?.LeadId) {
      console.error('Invalid user or missing LeadId:', user);
      user.CustomerStatus = 'Invalid user data';
      return;
    }
  
    const payload = {
      CustomerId: user.leadWithDetails.LeadId,
      CompanyName: 'Virtuzone',
    };
  
    // console.log('Initiating status check with payload:', payload);
  
    // Start the global loader
    this.isLoading = true;
  
    // Call the API to check status
    this.adminAuthService.checkStatus(payload).subscribe(
      (response) => {
        // console.log('API response:', response);
        // Update user's CustomerStatus with the response
        user.CustomerStatus = response.data?.CustomerStatus || 'Status not found';
      },
      (error) => {
        console.error('Error during API call:', error);
        // Set fallback status on error
        user.CustomerStatus = 'Error fetching status';
      },
      () => {
        // Stop the global loader when the API call completes
        this.isLoading = false;
      }
    );
  }
  
  
  
  openFileModal(user: any): void {
    if (user.additionalUploadedFiles && user.additionalUploadedFiles.length > 0) {
      this.selectedAdditionalFiles = user.additionalUploadedFiles; // Populate files
      this.showFileModal = true; // Show modal
    } else {
      console.warn('No files available.');
    }
  }
  
  closeFileModal(): void {
    this.showFileModal = false; // Hide modal
    this.selectedAdditionalFiles = []; // Clear files
  }
  
  
  isImage(fileName: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }

  openDetailsModal(details: any): void {
    this.selectedUser = details; // Assign selected customer details
    this.showDetailsModal = true; // Open the modal for customer
    // console.log('Opening modal for user:', details);
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
    console.log("before : ", this.filteredUserList);
    this.searchTerm = this.searchTerm.trim();
   
  
    if (this.searchTerm) {
      this.filteredUserList = this.userList.filter(user =>
        (user?.leadWithDetails?.FirstName || '').includes(this.searchTerm) ||
        (`${user?.leadWithDetails?.FirstName || ''} ${user?.leadWithDetails?.LastName || ''}`).trim().includes(this.searchTerm) ||
        (user?.leadWithDetails?.LastName || '').includes(this.searchTerm) ||
        (user?.leadWithDetails?.Email || '').toLowerCase().includes(this.searchTerm) ||
        (user?.leadWithDetails?.Nationality || '').includes(this.searchTerm) ||
        (user?.userDetails?.birthday || '').includes(this.searchTerm) || // Match date
        (user?.userDetails?.resident || '').includes(this.searchTerm) ||
        (user?.userDetails?.working || '').includes(this.searchTerm) ||
        (user?.userDetails?.salary?.toString() || '').includes(this.searchTerm) ||
        (user?.userDetails?.companyname || '').includes(this.searchTerm) ||
        (user?.userDetails?.Bank || '').includes(this.searchTerm) ||
        (user?.screeningDetails?.matchScore?.toString() || '').includes(this.searchTerm) ||
        (user?.CustomerStatus || '').toLowerCase().includes(this.searchTerm)
      );
    
      console.log("after : ", this.filteredUserList);

       // Console log userDetails for each user in the filtered list
       console.group("Filtered User Details:"); // Optional: Group console messages for better readability
       this.filteredUserList.forEach(user => {
         console.log("User Details: ", user.userDetails);
       });
       console.groupEnd(); // Optional: End the console group
    } else {
      this.filteredUserList =  [...this.userList]; // Reset to full list if search is empty
    }
  }
  
  
}
