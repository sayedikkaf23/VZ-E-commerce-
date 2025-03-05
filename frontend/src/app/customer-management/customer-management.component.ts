import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service'; 
@Component({
  selector: 'app-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrl: './customer-management.component.css'
})
export class CustomerManagementComponent implements OnInit {
  userList: any[] = [];             // All user data
  filteredUserList: any[] = [];       // User data after filtering/search

  // Pagination variables
  currentPage: number = 1;
  itemsPerPage: number = 10;          // Adjust as needed

  // Modal and search variables
  selectedCustomer: { [key: string]: any } | null = null;
  showDetailsModal: boolean = false;
  searchTerm: string = '';  

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserDetails(); // Call the method when the component loads
  }

  fetchUserDetails(): void {
    this.adminAuthService.getUserDetails().subscribe(
      (response) => {
        this.userList = response;
        this.filteredUserList = [...this.userList]; // Initialize filtered list
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  // Pagination helper: returns the subset of users for the current page
  paginatedUserList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUserList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calculate the total number of pages based on filtered user count
  get totalPages(): number {
    return Math.ceil(this.filteredUserList.length / this.itemsPerPage);
  }

  // Generate an array of page numbers for display in the template
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

  // Updated search to reset to first page on filter change
  onSearch() {
    this.searchTerm = this.searchTerm.trim();
    if (this.searchTerm) {
      this.filteredUserList = this.userList.filter(user =>
        (`${user?.firstName || ''} ${user?.lastName || ''}`).trim().includes(this.searchTerm) ||
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.nationality.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.birthday && user.birthday.includes(this.searchTerm))
      );
    } else {
      this.filteredUserList = [...this.userList]; // Reset to full list if search is empty
    }
    this.currentPage = 1; // Reset page to first on new search
  }

  // Modal functions and helper functions remain unchanged
  openDetailsModal(details: any): void {
    this.selectedCustomer = details;
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
}
