import { Component, OnInit } from '@angular/core';
import { MailManagementService } from '../service/mail-management.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-admin-mail-management',
  templateUrl: './admin-mail-management.component.html',
  styleUrl: './admin-mail-management.component.css',
})
export class AdminMailManagementComponent {
  mailList: any[] = []; // To store fetched mail data
  selectedMailDetails: any[] = []; // To store selected mail details
  showModal: boolean = false; // Flag to control modal visibility
  userList: any[] = []; // To store the fetched user data
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;
  loadingStatuses: { [key: string]: boolean } = {}; // To track loading state for each user
  showFileModal: boolean = false; // Flag to control file modal visibility
  selectedFiles: any[] = []; // To store selected files for the modal
  selectedMail: { [key: string]: any } | null = null;

  showDetailsModal: boolean = false;
  

  constructor(private mailManagementService: MailManagementService) {}

  ngOnInit(): void {
    this.fetchMailDetails(); // Call the method when the component loads
  }

  fetchMailDetails(): void {
    this.mailManagementService.getVirtaulData().subscribe(
      (response) => {
        this.mailList = response; // Assign the API response to the mailList array
        this.checkColumnData(); // Check columns only after data is loaded
      },
      (error) => {
        console.error('Error fetching mail details:', error);
      }
    );
  }

  checkColumnData(): void {
    this.hasSalaryData = this.userList.some((user) => !!user.salary);
    this.hasCompanyNameData = this.userList.some((user) => !!user.companyname);
  }
  isLoading: boolean = false; // Global loader state

  checkStatus(user: any): void {
    const payload = {
      CustomerId: user.leadWithDetails.LeadId,
      CompanyName: 'Virtuzone',
    };
  
    // Start the global loader
    this.isLoading = true;
  
    this.mailManagementService.checkStatus(payload).subscribe(
      (response) => {
        // Update user status with the response
        user.CustomerStatus = response.data?.CustomerStatus || 'Status not found';
        // console.log('Status check response:', response);
      },
      (error) => {
        // Handle API error
        console.error('Error checking status:', error);
      },
      () => {
        // Stop the global loader
        this.isLoading = false;
      }
    );
  }
  
  openMailDetails(details: any): void {
    this.selectedMailDetails = details; // Assign selected mail details
    this.showModal = true; // Open the modal for shareholders
  }

  openDetailsModal(details: any): void {
    this.selectedMail = details; // Assign selected mail details
    this.showDetailsModal = true; // Open the modal for mail
  }

  // Helper function to get keys of an object
  objectKeys(obj: { [key: string]: any } | null): string[] {
    return obj ? Object.keys(obj) : []; // Return object keys or empty array if null
  }

  // Helper function to check if a value is an object
  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  closeModal(): void {
    this.showModal = false; // Close the modal
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false; // Close the modal
  }

  openFileModal(files: any[]): void {
    if (files && files.length > 0) {
      this.selectedFiles = files; // Assign files to display in the modal
      this.showFileModal = true; // Open the file modal
    } else {
      this.selectedFiles = []; // Clear previous files
      this.showFileModal = true; // Still open the modal to show the "No files available" message
      console.error('No files available for this mail.');
    }
  }
  

  closeFileModal(): void {
    this.showFileModal = false; // Close the file modal
  }
}
