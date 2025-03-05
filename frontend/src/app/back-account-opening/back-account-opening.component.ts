import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';
import { ToastrService } from 'ngx-toastr'; // Import if needed

@Component({
  selector: 'app-back-account-opening',
  templateUrl: './back-account-opening.component.html',
  styleUrls: ['./back-account-opening.component.css'],
})
export class BackAccountOpeningComponent implements OnInit {
  userList: any[] = []; // To store the fetched user data
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;
  loadingStatuses: { [key: string]: boolean } = {};
  selectedAdditionalFiles: any[] = [];
  showFileModal: boolean = false;
  selectedUser: { [key: string]: any } | null = null;
  showDetailsModal: boolean = false;
  searchTerm: string = '';
  filteredUserList: any[] = [];
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Change this to the number of items per page

  isLoading: boolean = false; // Global loading state

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserDetails();
  }

  fetchUserDetails(): void {
    this.adminAuthService.getPersonalBank().subscribe(
      (response) => {
        this.userList = response;
        this.filteredUserList = [...this.userList];
        this.checkColumnData();
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  checkColumnData(): void {
    this.hasSalaryData = this.userList.some((user) => !!user.userDetails?.salary);
    this.hasCompanyNameData = this.userList.some((user) => !!user.userDetails?.companyname);
  }

  // Pagination helper: returns the subset of users for the current page
  paginatedUserList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUserList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Compute total pages based on the length of the filtered list
  get totalPages(): number {
    return Math.ceil(this.filteredUserList.length / this.itemsPerPage);
  }

  // Generate an array of page numbers for display
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

  checkStatus(user: any): void {
    if (!user || !user.leadWithDetails?.LeadId) {
      console.error('Invalid user or missing LeadId:', user);
      user.CustomerStatus = 'Invalid user data';
      return;
    }

    const payload = {
      CustomerId: user.leadWithDetails.LeadId,
      CompanyName: 'Virtuzone',
    };

    this.isLoading = true;

    this.adminAuthService.checkStatus(payload).subscribe(
      (response) => {
        user.CustomerStatus = response.data?.CustomerStatus || 'Status not found';
      },
      (error) => {
        console.error('Error during API call:', error);
        user.CustomerStatus = 'Error fetching status';
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  openFileModal(user: any): void {
    if (user.additionalUploadedFiles && user.additionalUploadedFiles.length > 0) {
      this.selectedAdditionalFiles = user.additionalUploadedFiles;
      this.showFileModal = true;
    } else {
      console.warn('No files available.');
    }
  }

  closeFileModal(): void {
    this.showFileModal = false;
    this.selectedAdditionalFiles = [];
  }

  isImage(fileName: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }

  openDetailsModal(details: any): void {
    this.selectedUser = details;
    this.showDetailsModal = true;
  }

  objectKeys(obj: { [key: string]: any } | null): string[] {
    return obj ? Object.keys(obj) : [];
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
  }

  onSearch(): void {
    this.searchTerm = this.searchTerm.trim();

    if (this.searchTerm) {
      this.filteredUserList = this.userList.filter(user =>
        (user?.leadWithDetails?.FirstName || '').includes(this.searchTerm) ||
        (`${user?.leadWithDetails?.FirstName || ''} ${user?.leadWithDetails?.LastName || ''}`)
          .trim().includes(this.searchTerm) ||
        (user?.leadWithDetails?.LastName || '').includes(this.searchTerm) ||
        (user?.leadWithDetails?.Email || '').toLowerCase().includes(this.searchTerm) ||
        (user?.leadWithDetails?.Nationality || '').includes(this.searchTerm) ||
        (user?.userDetails?.birthday || '').includes(this.searchTerm) ||
        (user?.userDetails?.resident || '').includes(this.searchTerm) ||
        (user?.userDetails?.working || '').includes(this.searchTerm) ||
        (user?.userDetails?.salary?.toString() || '').includes(this.searchTerm) ||
        (user?.userDetails?.companyname || '').includes(this.searchTerm) ||
        (user?.userDetails?.Bank || '').includes(this.searchTerm) ||
        (user?.screeningDetails?.matchScore?.toString() || '').includes(this.searchTerm) ||
        (user?.CustomerStatus || '').toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredUserList = [...this.userList];
    }

    // Reset to first page after filtering
    this.currentPage = 1;
  }
}
