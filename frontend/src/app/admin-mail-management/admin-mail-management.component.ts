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
  showCompanyModal: boolean = false; 
  userList: any[] = []; // To store the fetched user data
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;
  loadingStatuses: { [key: string]: boolean } = {}; // To track loading state for each user
  showFileModal: boolean = false; // Flag to control file modal visibility
  selectedFiles: any[] = []; // To store selected files for the modal
  selectedMail: { [key: string]: any } | null = null;
  searchTerm: string = '';  
  filteredMailList: any[] = []; // Filtered user data
  isLoading: boolean = false; // Red Loader state
 
  showDetailsModal: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10; // Adjust as needed
  totalRecords: number = 0;
  totalPages: number = 0;
  selectedMailComapny: any;
  salesforceResponseMatchScreening: any = {}; // Declare this at the top
 
 
selectedProducts: any[] = [];
selectedDocuments: any[] = [];
showProductModal: boolean = false;
showDocumentModal: boolean = false;
  createdDate: Date | undefined;
 
  constructor(private mailManagementService: MailManagementService) {}
 
  ngOnInit(): void {
    this.fetchMailDetails(this.currentPage, this.itemsPerPage);
  }
 
  fetchMailDetails(page: number, limit: number): void {
    this.isLoading = true;
    this.mailManagementService.getVirtualData(page, limit).subscribe({
      next: (response) => {
        console.log(response); // Check the response
        this.mailList = response.data;
        console.log(this.mailList[0].createdAt);
        this.filteredMailList = [...this.mailList].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.totalRecords = response.totalRecords;
        this.totalPages = response.totalPages;
        this.currentPage = page;
      },
      error: (error) => {
        console.error('Error fetching mail details:', error);
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
      CustomerId: user.leadWithDetails.LeadId,
      CompanyName: 'Virtuzone',
    };
 
    this.isLoading = true; // Start the red loader
 
    this.mailManagementService.checkStatus(payload).subscribe(
      (response) => {
        user.CustomerStatus = response.data?.CustomerStatus || 'Status not found';
      },
      (error) => {
        console.error('Error checking status:', error);
      },
      () => {
        setTimeout(() => {
          this.isLoading = false; // Stop the red loader smoothly
        }, 500);
      }
    );
  }
 
 
  openMailDetails(details: any): void {
    this.selectedMailComapny = details; // Assign selected mail details
    console.log("Mail details = ",this.selectedMailComapny)
    this.showCompanyModal = true; // Open the modal for shareholders
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
    this.showCompanyModal =false;
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
 
  // Next/Previous/Go to Page
  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.isLoading) {
      this.fetchMailDetails(this.currentPage + 1, this.itemsPerPage);
    }
  }
 
  previousPage(): void {
    if (this.currentPage > 1 && !this.isLoading) {
      this.fetchMailDetails(this.currentPage - 1, this.itemsPerPage);
    }
  }
 
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      this.fetchMailDetails(page, this.itemsPerPage);
    }
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

 
 
openDocumentModal(user: any): void {
  console.log('Document Modal Opened', user); // Debug
  this.selectedDocuments =[...( user.additionalUploadedFiles || []), ...(user.tradeLicenseFile || [])];
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
 