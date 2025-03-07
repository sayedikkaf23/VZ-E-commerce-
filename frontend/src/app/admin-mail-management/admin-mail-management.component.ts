import { Component, OnInit } from '@angular/core';
import { MailManagementService } from '../service/mail-management.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService
import { ChangeDetectorRef } from '@angular/core';

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
  searchTerm: string = '';  
  filteredMailList: any[] = []; // Filtered user data

  showDetailsModal: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10; // Adjust as needed


  constructor(private mailManagementService: MailManagementService) {}

  ngOnInit(): void {
    this.fetchMailDetails(); // Call the method when the component loads
  }

  fetchMailDetails(): void {
    this.mailManagementService.getVirtaulData().subscribe(
      (response) => {
        this.mailList = response; // Assign the API response to the mailList array
        this.filteredMailList = [...this.mailList];
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

  onSearch(): void {
    this.searchTerm = this.searchTerm.trim().toLowerCase();
    if (this.searchTerm) {
      this.filteredMailList = this.mailList.filter(mail =>
        (`${mail?.leadWithDetails?.FirstName.trim().toLowerCase() || ''} ${mail?.leadWithDetails?.LastName.trim().toLowerCase() || ''}`)
          .includes(this.searchTerm) ||
        (mail?.leadWithDetails?.FirstName || '').toLowerCase().includes(this.searchTerm) ||
        (mail?.leadWithDetails?.LastName || '').toLowerCase().includes(this.searchTerm) ||
        (mail?.leadWithDetails?.Email || '').toLowerCase().includes(this.searchTerm) ||
        (mail?.userDetails?.CompanyName || '').toLowerCase().includes(this.searchTerm) ||
        (mail?.userDetails?.CompanyIncorporated || '').toLowerCase().includes(this.searchTerm) ||
        (mail?.userDetails?.mobileNumber?.internationalNumber || '').includes(this.searchTerm) ||
        (mail?.userDetails?.shareholdercount?.toString() || '').includes(this.searchTerm) ||
        (mail?.screeningDetails?.matchScore?.toString() || '').includes(this.searchTerm) ||
        (mail?.CustomerStatus || '').toLowerCase().includes(this.searchTerm)
      );
    } else {
      // Reset filtered list if search term is empty
      this.filteredMailList = [...this.mailList];
    }
    // Reset pagination to first page after search
    this.currentPage = 1;
  }

  // ----------------------------
  // Pagination Helper Methods
  // ----------------------------

  // Returns the mail records for the current page
  paginatedMailList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMailList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Total number of pages based on the filtered list and items per page
  get totalPages(): number {
    return Math.ceil(this.filteredMailList.length / this.itemsPerPage);
  }

  // Create an array for pagination links (e.g., [1, 2, 3, ...])
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Navigate to the previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Navigate to the next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Jump to a specific page
  goToPage(page: number): void {
    this.currentPage = page;
  }

  fromDate: string = '';
toDate: string = '';

onDateFilter(): void {
  if (this.fromDate && this.toDate) {
    const startDate = new Date(this.fromDate);
    const endDate = new Date(this.toDate);

    // Set time to 00:00:00 to include the whole day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    this.filteredMailList = this.mailList.filter((mail) => {
      const createdDate = new Date(mail.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });
  } else {
    // Reset the list if no dates are selected
    this.filteredMailList = [...this.mailList];
  }
  
  this.currentPage = 1; // Reset Pagination
}


salesforceResponseMatchScreening: any = {}; // Declare this at the top


selectedProducts: any[] = [];
selectedDocuments: any[] = [];
showProductModal: boolean = false;
showDocumentModal: boolean = false;
openProductModal(user: any): void {
  console.log('Product Modal Opened', user); // Debug
  this.salesforceResponseMatchScreening = user.salesforceResponseMatchScreening; // ✅ Store the full object
  this.selectedProducts = this.salesforceResponseMatchScreening?.products || [];
  console.log('Products:', this.selectedProducts); // Debug
  this.showProductModal = true; 
}


openDocumentModal(user: any): void {
  console.log('Document Modal Opened', user); // Debug
  this.selectedDocuments = user.additionalUploadedFiles || [];
  console.log('Documents:', this.selectedDocuments); // Debug
  this.showDocumentModal = true; 
}


closeProductModal(): void {
  this.showProductModal = false;
  this.selectedProducts = [];

}



closeDocumentModal(): void {
  this.showDocumentModal = false;
  this.selectedDocuments = [];
}
openClientDetails(shareholders: any[]): void {
  // console.log(shareholders)
  this.selectedMailDetails = shareholders; // Assign shareholder data to display in the modal
  this.showModal = true; // Open the modal

}



}
