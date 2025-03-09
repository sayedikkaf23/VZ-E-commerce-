import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';
 
@Component({
  selector: 'app-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.css']
})
export class CustomerManagementComponent implements OnInit {
  userList: any[] = [];
  filteredUserList: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  selectedCustomer: { [key: string]: any } | null = null;
  showDetailsModal: boolean = false;
  searchTerm: string = '';
  fromDate: string = '';
  toDate: string = '';
 
  constructor(private adminAuthService: AdminAuthService) {}
 
  ngOnInit(): void {
    this.fetchUserDetails();
  }
 
  fetchUserDetails(): void {
    this.adminAuthService.getUserDetails().subscribe(
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
 
  onSearch(): void {
    this.searchTerm = this.searchTerm.trim().toLowerCase();
    if (this.searchTerm) {
      this.filteredUserList = this.userList.filter(user =>
        // Search by first and last name from leadWithDetails
        (`${user.leadWithDetails.FirstName || ''} ${user.leadWithDetails.LastName || ''}`)
          .trim().toLowerCase().includes(this.searchTerm) ||
        // Search by email from leadWithDetails
        (user.leadWithDetails.Email && user.leadWithDetails.Email.toLowerCase().includes(this.searchTerm)) ||
        // Search by nationality from leadWithDetails
        (user.leadWithDetails.Nationality && user.leadWithDetails.Nationality.toLowerCase().includes(this.searchTerm)) ||
        // Optionally search birthday if it exists
        (user.birthday && user.birthday.includes(this.searchTerm)) ||
        // Search by Quote Payment ID from quotePaymentWithDetails
        (user.quotePaymentWithDetails && user.quotePaymentWithDetails.QuotePaymentId && 
         user.quotePaymentWithDetails.QuotePaymentId.toLowerCase().includes(this.searchTerm))
      );
    } else {
      this.filteredUserList = [...this.userList];
    }
    this.currentPage = 1;
  }
  
  onDateFilter(): void {
    if (this.fromDate && this.toDate) {
      const fromDateObj = new Date(this.fromDate);
      const toDateObj = new Date(this.toDate);
 
      // Adjust times to compare entire days
      fromDateObj.setHours(0, 0, 0, 0);
      toDateObj.setHours(23, 59, 59, 999);
 
      this.filteredUserList = this.userList.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= fromDateObj && userDate <= toDateObj;
      });
 
      this.currentPage = 1;
    } else {
      console.log("Please select both From and To dates.");
      // Optionally reset filtered list to full list if needed
      // this.filteredUserList = [...this.userList];
    }
  }
 
 
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
  handleUserAction(user: any): void {
    let newStatus = '';
 
    if (user.kycStatus === 'Pending' || user.kycStatus === 'Rejected') {
      newStatus = 'Approved'; // Allow both Pending and Rejected users to be approved
    } else if (user.kycStatus === 'Auto Approved' || user.kycStatus === 'Approved') {
      newStatus = 'Rejected';
    }
 
 
    // Show confirmation before making API call
    if (confirm(`Are you sure you want to update  status to ${newStatus}?`)) {
      const requestData = {
        id: user._id, // Ensure you are passing the correct ID field
        kycStatus: newStatus,
        QuotePaymentId: user.quotePaymentWithDetails.QuotePaymentId, // Add QuotePaymentId if required by the API
      };
 
      this.adminAuthService.updateKycStatus(requestData).subscribe(
        (response) => {
          alert(`User status updated to ${newStatus}`);
          user.kycStatus = newStatus; // Update UI immediately
        },
        (error) => {
          console.error('Error updating KYC status:', error);
          alert('Failed to update status. Please try again.');
        }
      );
    }
  }
 
  getButtonLabel(status: string): string {
    switch (status) {
      case 'Pending':
        return 'Approve';
      case 'Auto Approved':
        return 'Reject';
      case 'Approved':
        return 'Reject';
      case 'Rejected':
        return 'Approve';
      default:
        return 'Approve';
    }
  }
 
  getButtonClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'green-button';
      case 'Auto Approved':
        return 'green-button';
      case 'Rejected':
        return 'green-button';
      default:
        return 'green-button';
    }
  }
 
}
 
 