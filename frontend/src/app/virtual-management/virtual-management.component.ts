import { Component, OnInit } from '@angular/core';
import { VirtualManagementService } from '../service/virtual-management.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-virtual-management',
  templateUrl: './virtual-management.component.html',
  styleUrls: ['./virtual-management.component.css']
})
export class VirtualManagementComponent implements OnInit {
  clientList: any[] = []; // To store fetched client data
  selectedClientDetails: any[] = []; // To store selected client's shareholder details
  showModal: boolean = false; // Flag to control modal visibility
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;
  userList: any[] = []; // To store the fetched user data
  loadingStatuses: { [key: string]: boolean } = {}; // To track loading state for each user
  showFileModal: boolean = false; // Flag for file modal
  selectedFiles: any[] = []; // To store selected files for the modal
  searchTerm: string = '';  
  filteredClientList: any[] = []; // Filtered user data
  constructor(private virtualManagementService: VirtualManagementService) {}

  selectedUser: { [key: string]: any } | null = null;

  showDetailsModal: boolean = false;

 
  ngOnInit(): void {
    this.fetchClientDetails(); // Call the method when the component loads
  }
 
  fetchClientDetails(): void {
    this.virtualManagementService.getVirtaulData().subscribe(
      (response) => {
        this.clientList = response; // Assign the API response to the clientList array
        this.checkColumnData(); // Check columns only after data is loaded
        this.filteredClientList = [...this.clientList]; // Initialize filtered list
      },
      (error) => {
        console.error('Error fetching client details:', error);
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
  
    this.virtualManagementService.checkStatus(payload).subscribe(
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
  
  openClientDetails(shareholders: any[]): void {
    // console.log(shareholders)
    this.selectedClientDetails = shareholders; // Assign shareholder data to display in the modal
    this.showModal = true; // Open the modal
  }
 
  closeModal(): void {
    this.showModal = false; // Close the modal
  }
  openFileModal(files: any[]): void {
    if (files && files.length > 0) {
      this.selectedFiles = files; // Assign files to display in the modal
      this.showFileModal = true; // Open the modal
      // console.log('Modal opened with files:', files); // Debugging
    } else {
      console.error('No files available for this client.');
    }
  }
  

  closeFileModal(): void {
    this.showFileModal = false; // Close the file modal
  }


  openDetailsModal(details: any): void {
    console.log('Selected User Data:',details);
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

  onSearch() {
    this.searchTerm = this.searchTerm.trim().toLowerCase();
  
    if (this.searchTerm) {
      this.filteredClientList = this.clientList.filter(client =>
        (`${client?.leadWithDetails?.FirstName.trim().toLowerCase() || ''} ${client?.leadWithDetails?.LastName.trim().toLowerCase() || ''}`).includes(this.searchTerm) ||
        (client?.leadWithDetails?.FirstName || '').toLowerCase().includes(this.searchTerm) ||
        (client?.leadWithDetails?.LastName || '').toLowerCase().includes(this.searchTerm) ||
        (client?.leadWithDetails?.Email || '').toLowerCase().includes(this.searchTerm) ||
        (client?.userDetails?.CompanyName || '').toLowerCase().includes(this.searchTerm) ||
        (client?.userDetails?.CompanyIncorporated || '').toLowerCase().includes(this.searchTerm) ||
        (client?.userDetails?.shareholdercount?.toString() || '').includes(this.searchTerm) ||
        (client?.userDetails?.mobileNumber?.internationalNumber || '').includes(this.searchTerm) ||
        (client?.screeningDetails?.matchScore?.toString() || '').includes(this.searchTerm) ||
        (client?.CustomerStatus || '').toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredClientList = [...this.clientList]; // Reset list if search is empty
    }
  }
  
  

}
 