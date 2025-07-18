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
  searching: boolean = false;
  dateFiltering: boolean = false;
 
 
  constructor(private adminAuthService: AdminAuthService,private toastr: ToastrService) {}
 
  ngOnInit(): void {
    this.fetchUserDetails(this.currentPage, this.itemsPerPage);
 
  }
 
  fetchUserDetails(page: number, limit: number): void {
    this.isLoading = true;
    this.adminAuthService.getPersonalBank(page, limit).subscribe({
      next: (response) => {
        // 1) sort descending by createdAt (newest first)
        const sortedData = (response.data as any[])
          .sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
  
        // 2) assign both userList & filteredUserList
        this.userList = sortedData;
        this.filteredUserList = [...sortedData];
  
        // 3) pagination
        this.totalRecords = response.totalRecords;
        this.totalPages   = response.totalPages;
        this.currentPage  = response.currentPage;
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
    console.log(this.dateFiltering)
    if(this.searching){
      if (this.currentPage < this.totalPages && !this.isLoading) {
      this.Search(this.currentPage + 1, this.itemsPerPage, this.searchTerm)
    }
    }
    else if(this.dateFiltering){
      if (this.currentPage < this.totalPages && !this.isLoading) {
      this.DateFilter(this.currentPage + 1, this.itemsPerPage, this.fromDate, this.toDate )
    }
    }
    else {
      if (this.currentPage < this.totalPages && !this.isLoading) {
      this.fetchUserDetails(this.currentPage + 1, this.itemsPerPage);
    }
    } 
  }
 
  previousPage(): void {
      if(this.searching){
      if (this.currentPage < this.totalPages && !this.isLoading) {
      this.Search(this.currentPage + 1, this.itemsPerPage, this.searchTerm)
    }
    }
    else if(this.dateFiltering){
      if (this.currentPage < this.totalPages && !this.isLoading) {
      this.DateFilter(this.currentPage + 1, this.itemsPerPage, this.fromDate, this.toDate )
    }
    }
    else {
      if (this.currentPage > 1 && !this.isLoading) {
      this.fetchUserDetails(this.currentPage - 1, this.itemsPerPage);
    }
    }
  }
 
  goToPage(page: number): void {
    if(this.searching){
      if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      this.Search(this.currentPage + 1, this.itemsPerPage, this.searchTerm)
    }
    }
    else if(this.dateFiltering){
      if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      this.DateFilter(page, this.itemsPerPage, this.fromDate, this.toDate )
    }
    }
    else {
      if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      this.fetchUserDetails(page, this.itemsPerPage);
    }
    } 
    
  }
showCompanyModal = false;
selectedCompanyDetails: any = null;

openCompanyModal(leadDetails: any) {
  this.selectedCompanyDetails = leadDetails;
  this.showCompanyModal = true;
}

closeCompanyModal() {
  this.selectedCompanyDetails = null;
  this.showCompanyModal = false;
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

  onSearch(){
    this.currentPage = 1;
    if(this.searchTerm === ''){
      this.searching = false;
      this.toastr.warning('Invalid Search');
    }
    else {
    this.searching = true;
    this.searchTerm = this.searchTerm.trim();
    this.Search(this.currentPage, this.itemsPerPage, this.searchTerm)
    }
  }
 
  Search(page:number, limit:number, search: string): void {
    this.isLoading = true;
    this.adminAuthService.getSearchedPersonalBank(page, limit,search).subscribe({
      next: (response) => {
        // 1) sort descending by createdAt (newest first)
        const sortedData = (response.data as any[])
          .sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
  
        // 2) assign both userList & filteredUserList
        this.userList = sortedData;
        this.filteredUserList = [...sortedData];
  
        // 3) pagination
        this.totalRecords = response.totalRecords;
        this.totalPages   = response.totalPages;
        this.currentPage  = response.currentPage;
        this.searching = response.searching;
      },
      error: (error) => {
        console.error('Error fetching searched user details:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });

  }


fromDate: string = '';
toDate: string = '';

 onDateFilter(){
  this.currentPage = 1;
    if(this.fromDate === '' || this.toDate === ''){
      this.dateFiltering = false;
      this.toastr.warning('Invalid Dates');
    }
    else {
      this.dateFiltering = true;
      console.log(this.fromDate);
      console.log(this.toDate);
      this.DateFilter(this.currentPage, this.itemsPerPage, this.fromDate, this.toDate )
    }
  }

DateFilter(page:number, limit:number, fromDate: string, toDate: string): void {
  this.isLoading = true;
    this.adminAuthService.getDateFilteredPersonalBank(page, limit,fromDate,toDate).subscribe({
      next: (response) => {
        console.log(response);
        // 1) sort descending by updatedAt (newest first)
        const sortedData = (response.data as any[])
          .sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
  
        // 2) assign both userList & filteredUserList
        this.userList = sortedData;
        this.filteredUserList = [...sortedData];
  
        // 3) pagination
        this.totalRecords = response.totalRecords;
        this.totalPages   = response.totalPages;
        this.currentPage  = response.currentPage;
        this.dateFiltering = response.datefiltering
        console.log( response.datefiltering)
      },
      error: (error:any) => {
        console.error('Error fetching searched user details:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
}
 
}
 