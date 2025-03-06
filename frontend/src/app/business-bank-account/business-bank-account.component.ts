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
  searchTerm: string = '';  
  filteredUserList: any[] = []; // Filtered user data
  currentPage: number = 1;
  itemsPerPage: number = 10; // Adjust the items per page as neede

  selectedUserFields: string[] = ['isMatched', 'caseId', 'customerId', 'highestScoringResult'];
  selectedProducts: any[] = [];
  selectedDocuments: any[] = [];
  showProductModal: boolean = false;
  showDocumentModal: boolean = false;

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
        this.filteredUserList = [...this.userList];
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

// 1) Return only the users for the current page
paginatedUserList(): any[] {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredUserList.slice(startIndex, startIndex + this.itemsPerPage);
}

// 2) Calculate total pages
get totalPages(): number {
  return Math.ceil(this.filteredUserList.length / this.itemsPerPage);
}

// 3) Create an array of pages for the template
get totalPagesArray(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

// 4) Navigate to the previous page
previousPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

// 5) Navigate to the next page
nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}

// 6) Jump to a specific page
goToPage(page: number): void {
  this.currentPage = page;
}

onSearch(): void {
  this.searchTerm = this.searchTerm.trim().toLowerCase();
  if (this.searchTerm) {
    this.filteredUserList = this.userList.filter(user =>
      (`${user?.leadWithDetails?.FirstName?.trim().toLowerCase() || ''} ${user?.leadWithDetails?.LastName?.trim().toLowerCase() || ''}`)
        .includes(this.searchTerm) ||
      (user?.leadWithDetails?.FirstName || '').toLowerCase().includes(this.searchTerm) ||
      (user?.leadWithDetails?.LastName || '').toLowerCase().includes(this.searchTerm) ||
      (user?.leadWithDetails?.Email || '').toLowerCase().includes(this.searchTerm) ||
      (user?.leadWithDetails?.Nationality || '').toLowerCase().includes(this.searchTerm) ||
      (user?.userDetails?.birthday || '').includes(this.searchTerm) ||
      (user?.leadWithDetails?.Phone || '').includes(this.searchTerm) ||
      (user?.jurisdiction || '').toLowerCase().includes(this.searchTerm) ||
      (user?.userDetails?.shareholdercount?.toString() || '').includes(this.searchTerm) ||
      (user?.userDetails?.Turnover?.toString() || '').toLowerCase().includes(this.searchTerm) ||
      (user?.screeningDetails?.matchScore?.toString() || '').includes(this.searchTerm) ||
      (user?.CustomerStatus || '').toLowerCase().includes(this.searchTerm)
    );
  } else {
    this.filteredUserList = [...this.userList];
  }

  // Reset to first page after search
  this.currentPage = 1;
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
  
  openProductModal(user: any): void {
    this.selectedProducts = user.salesforceResponseMatchScreening?.products || [];
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProducts = [];
  }

  openDocumentModal(user: any): void {
    this.selectedDocuments = user.additionalUploadedFiles || [];
    this.showDocumentModal = true;
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.selectedDocuments = [];
  }

  fromDate: string = '';
toDate: string = '';

onDateFilter(): void {
  if (this.fromDate && this.toDate) {
    this.filteredUserList = this.userList.filter((user) => {
      const createdDate = new Date(user.createdAt);
      const startDate = new Date(this.fromDate);
      const endDate = new Date(this.toDate);
      return createdDate >= startDate && createdDate <= endDate;
    });
  } else {
    this.filteredUserList = [...this.userList];
  }
  this.currentPage = 1; // Reset Pagination
}
}
