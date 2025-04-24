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
  totalRecords: number = 0;
  totalPages: number = 0;
  selectedUserFields: string[] = ['isMatched', 'caseId', 'customerId', 'highestScoringResult'];
  selectedProducts: any[] = [];
  selectedDocuments: any[] = [];
  showProductModal: boolean = false;
  showDocumentModal: boolean = false;
  user: any; // Replace 'any' with the correct type if you have one
 
 
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
    this.fetchUserDetails(this.currentPage, this.itemsPerPage);
 
  }
  fetchUserDetails(page: number, limit: number): void {
    this.isLoading = true;
    this.adminAuthService.getBusinessBank(page, limit).subscribe({
      next: (response) => {
        // ── 1) sort by createdAt descending so newest records come first
        const sortedData = (response.data as any[]).sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
  
        // ── 2) assign lists
        this.userList         = sortedData;
        this.filteredUserList = [...sortedData];
  
        // ── 3) pagination meta
        this.totalRecords = response.totalRecords;
        this.totalPages   = response.totalPages;
        this.currentPage  = response.currentPage;
        
        // any other post-fetch logic…
        this.checkColumnData();
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
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
 
  previousPage(): void {
    if (this.currentPage > 1 && !this.isLoading) {
      this.fetchUserDetails(this.currentPage - 1, this.itemsPerPage);
    }
  }
 
  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.isLoading) {
      this.fetchUserDetails(this.currentPage + 1, this.itemsPerPage);
    }
  }
 
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      this.fetchUserDetails(page, this.itemsPerPage);
    }
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
      (user?.quotePaymentWithDetails?.QuotePaymentId || '').toLowerCase().includes(this.searchTerm)
 
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
  salesforceResponseMatchScreening: any = {}; // Declare this at the top
 
  openProductModal(row: any): void {
    /* 1️⃣  locate the quote block (works for both old & new payloads) */
    const quote =
      row?.quoteWithProductDetails ||           // current structure
      row?.salesforceResponseMatchScreening ||  // your older structure
      null;
  
    // if (!quote) {
    //   this.toastr.error('No product details found for this record');
    //   return;
    // }
  
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
 
  fromDate: string = '';
toDate: string = '';
 
onDateFilter(): void {
  if (this.fromDate && this.toDate) {
    const startDate = new Date(this.fromDate);
    const endDate = new Date(this.toDate);
 
    this.filteredUserList = this.userList.filter(user => {
      const userCreatedAt = new Date(user.createdAt); // Assuming createdAt is the date field in your user data
      return userCreatedAt >= startDate && userCreatedAt <= endDate;
    });
  } else {
    this.filteredUserList = [...this.userList]; // Reset to original list if no dates selected
  }
 
  this.currentPage = 1; // Reset pagination to first page after filtering
}
 
showShareholderModal: boolean = false;
selectedShareholders: any[] = [];
 
openShareholderModal(user: any): void {
  if (user?.userDetails?.shareholders && user.userDetails.shareholders.length > 0) {
    this.selectedShareholders = user.userDetails.shareholders;
    this.showShareholderModal = true;
  } else {
    console.log('No Shareholders Found');
  }
}
 
closeShareholderModal(): void {
  this.showShareholderModal = false;
  this.selectedShareholders = [];
}
 
}
 