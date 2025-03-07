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

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserDetails();
  }

  fetchUserDetails(): void {
    this.adminAuthService.getPersonalBank().subscribe(
      (response) => {
        this.userList = response;
        this.filteredUserList = [...this.userList];
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  paginatedUserList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUserList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUserList.length / this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  salesforceResponseMatchScreening: any = {}; // Declare this at the top


  openProductModal(user: any): void {
    console.log('Product Modal Opened', user); // Debug
    this.salesforceResponseMatchScreening = user.salesforceResponseMatchScreening; // ✅ Store the full object
    this.selectedProducts = this.salesforceResponseMatchScreening?.products || [];
    console.log('Products:', this.selectedProducts); // Debug
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
