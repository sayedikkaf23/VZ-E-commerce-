import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';
import { ToastrService } from 'ngx-toastr';
 
@Component({
  selector: 'app-back-account-opening',
  templateUrl: './back-account-opening.component.html',
  styleUrls: ['./back-account-opening.component.css'],
})
export class BackAccountOpeningComponent implements OnInit {
  userList: any[] = [];
  filteredUserList: any[] = [];
  selectedProducts: any[] = [];
  selectedDocuments: any[] = [];
  showProductModal: boolean = false;
  showDocumentModal: boolean = false;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  isLoading:boolean=false
  totalRecords: number = 0;
  totalPages: number = 0;
 
 
  constructor(private adminAuthService: AdminAuthService) {}
 
  ngOnInit(): void {
    this.fetchUserDetails(this.currentPage, this.itemsPerPage);
 
  }
 
  fetchUserDetails(page: number, limit: number): void {
    this.isLoading = true;
    this.adminAuthService.getPersonalBank(page, limit).subscribe({
      next: (response) => {
        /*
          Expected shape:
          {
            data: [...],
            totalRecords: number,
            totalPages: number,
            currentPage: number,
            pageSize: number
          }
        */
        this.userList = response.data;
        this.filteredUserList = [...this.userList];
 
        this.totalRecords = response.totalRecords;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;  // or just 'page'
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
 
  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.isLoading) {
      this.fetchUserDetails(this.currentPage + 1, this.itemsPerPage);
    }
  }
 
  previousPage(): void {
    if (this.currentPage > 1 && !this.isLoading) {
      this.fetchUserDetails(this.currentPage - 1, this.itemsPerPage);
    }
  }
 
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      this.fetchUserDetails(page, this.itemsPerPage);
    }
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
 
  onSearch(): void {
    this.searchTerm = this.searchTerm.trim().toLowerCase();
    if (this.searchTerm) {
      this.filteredUserList = this.userList.filter(user =>
        (user?.leadWithDetails?.FirstName || '').toLowerCase().includes(this.searchTerm) ||
        (user?.leadWithDetails?.LastName || '').toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredUserList = [...this.userList];
    }
    this.currentPage = 1;
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
 