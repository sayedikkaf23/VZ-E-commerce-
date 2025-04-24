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
  currentPage: number = 1;
  itemsPerPage: number = 10; // Adjust as needed
  totalRecords: number = 0;
  totalPages: number = 0;
 
  constructor(private virtualManagementService: VirtualManagementService) { }
 
  selectedUser: { [key: string]: any } | null = null;
 
  showDetailsModal: boolean = false;
 
 
  ngOnInit(): void {
    this.fetchClientDetails(this.currentPage, this.itemsPerPage);
  }
 
  fetchClientDetails(page: number, limit: number): void {
    this.isLoading = true;
    this.virtualManagementService.getVirtaulData(page, limit).subscribe({
      next: (response) => {
        /*
          We expect response to be in shape:
          {
            data: [...pageOfData...],
            totalRecords: number,
            totalPages: number,
            currentPage: number,
            pageSize: number
          }
        */
        this.clientList = response.data;
        this.filteredClientList = [...this.clientList].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.totalRecords = response.totalRecords;
        this.totalPages = response.totalPages;
        this.currentPage = page;
      },
      error: (error) => {
        console.error('Error fetching client details:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
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
    console.log('Selected User Data:', details);
    this.selectedUser = details; // Assign selected user details
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
 
  onSearch(): void {
    this.searchTerm = this.searchTerm.trim().toLowerCase();
    if (this.searchTerm) {
      this.filteredClientList = this.clientList.filter(client =>
        (`${client?.leadWithDetails?.FirstName.trim().toLowerCase() || ''} ${client?.leadWithDetails?.LastName.trim().toLowerCase() || ''}`)
          .includes(this.searchTerm) ||
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
      this.filteredClientList = [...this.clientList];
    }
    // Reset pagination to first page after a search
    this.currentPage = 1;
  }
 
  // --------------------------
  // Pagination Helper Methods
  // --------------------------
 
  // NAVIGATION
  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.isLoading) {
      this.fetchClientDetails(this.currentPage + 1, this.itemsPerPage);
    }
  }
 
  previousPage(): void {
    if (this.currentPage > 1 && !this.isLoading) {
      this.fetchClientDetails(this.currentPage - 1, this.itemsPerPage);
    }
  }
 
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      this.fetchClientDetails(page, this.itemsPerPage);
    }
  }
 
 
  fromDate: string = '';
  toDate: string = '';
 
  onDateFilter(): void {
    if (this.fromDate && this.toDate) {
      const startDate = new Date(this.fromDate);
      const endDate = new Date(this.toDate);
      endDate.setHours(23, 59, 59, 999);
 
      this.filteredClientList = this.clientList.filter((client) => {
        const createdDate = new Date(client.leadWithDetails?.CreatedDate);
        return createdDate >= startDate && createdDate <= endDate;
      });
    } else {
      this.filteredClientList = [...this.clientList];
    }
    this.currentPage = 1;
  }
 
 
  selectedProducts: any[] = [];
  selectedDocuments: any[] = [];
  showProductModal: boolean = false;
  showDocumentModal: boolean = false;
  salesforceResponseMatchScreening: any = {}; // Declare this at the top
 
  openProductModal(row: any): void {
    /* 1️⃣  locate the quote block (works for both old & new payloads) */
    const quote =
      row?.quoteWithProductDetails ||           // current structure
      row?.salesforceResponseMatchScreening ||  // your older structure
      null;
  
   
  
    /* 2️⃣  normalise every product so the template can stay the same */
    this.selectedProducts = (quote.product || quote.products || []).map((p: { ProductQuantity: any; productQuantity: any; ProductUnitprice: any; productUnitPrice: any; ProductName: any; productName: any; }) => {
      const qty   = p.ProductQuantity  ?? p.productQuantity  ?? 1;
      const price = p.ProductUnitprice ?? p.productUnitPrice ?? 0;
  
      return {
        productName:      p.ProductName      ?? p.productName      ?? '',
        productQuantity:  qty,
        productUnitPrice: price,
        total:            qty * price
      };
    });
  
    /* 3️⃣  expose totals for the modal footer */
    this.salesforceResponseMatchScreening = {
      subTotal:           quote.subTotal            ?? 0,
      totalIncludingVAT:  quote.totalIncludingVAT   ?? 0,
      totalVAT:          (quote.totalIncludingVAT   ?? 0) - (quote.subTotal ?? 0)
    };
  
    /* 4️⃣  open the modal */
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
 
}
 
 
 