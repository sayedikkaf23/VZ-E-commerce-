import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from '../service/user.service';
import { AdminAuthService } from '../service/admin-auth.service';
import Swal from 'sweetalert2';
 
@Component({
  selector: 'app-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.css']
})
export class CustomerManagementComponent implements OnInit {
  activeUser: any = null;
 
  userList: any[] = [];
  filteredUserList: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  selectedCustomer: { [key: string]: any } | null = null;
  showDetailsModal: boolean = false;
  searchTerm: string = '';
  fromDate: string = '';
  toDate: string = '';
  isLoading: boolean = false;
  totalRecords: number = 0; // Declare totalRecords to store the total number of items
  totalPages: number = 1;      // Total pages (from the API)
 
 
  constructor(private adminAuthService: AdminAuthService, private userService: UserService,) { }
 
  ngOnInit(): void {
    this.fetchUserDetails(this.currentPage, this.itemsPerPage);
 
  }
 
  fetchUserDetails(page: number, limit: number,searchTerm?: string): void {
    this.isLoading = true;
    this.adminAuthService.getUserDetails(page, limit,searchTerm).subscribe({
      next: (response) => {
        /*
          Based on your backend, response might look like:
          {
            data: [ ...pageOfData... ],
            totalRecords: 100,
            totalPages: 10
          }
        */
          
            // 1) sort descending by createdAt
              // 1) sort descending by createdAt, annotate a and b as any
              this.userList = (response.data as any[])
                .sort((a: any, b: any) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
              // 2) then set up pagination
              this.totalRecords = response.totalRecords;
              this.totalPages   = response.totalPages;
              this.currentPage  = page;
            },
            
                       // Track the current page
      
      error: (err) => {
        console.error('Error fetching user details:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
 
 
 
 
 
   // 2) NAVIGATION METHODS
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
 
 
 
 
  onSearch(): void {
    this.searchTerm = this.searchTerm.trim();
    // Reset to page 1 whenever the search changes
    this.currentPage = 1;
    // Fetch from server with the new searchTerm
    this.fetchUserDetails(this.currentPage, this.itemsPerPage, this.searchTerm);
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
  handleUserAction(user: any, action: string): void {
    let newStatus = '';
 
    if (action === 'Approve') {
      newStatus = 'Approved';
    } else if (action === 'Reject') {
      newStatus = 'Rejected';
    } else if (action === 'Check Status') {
      Swal.fire({
        title: 'User Status',
        text: `Current Status: ${user.kycStatus}`,
        icon: 'info',
        confirmButtonColor: '#FF5A5F',
      });
      return;
    }
 
    Swal.fire({
      title: 'Update KYC Status',
      text: `Do you want to update the user's status to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#FF5A5F',
    }).then((result) => {
      if (result.isConfirmed) {
        const requestData = {
          id: user._id,
          kycStatus: newStatus,
          QuotePaymentId: user.quotePaymentWithDetails?.QuotePaymentId || '', // Ensure this field exists
        };
 
        this.adminAuthService.updateKycStatus(requestData).subscribe(
          () => {
            Swal.fire({
              title: 'Status Updated!',
              text: `User's KYC status has been updated to ${newStatus}.`,
              icon: 'success',
              confirmButtonColor: '#FF5A5F',
            });
            user.kycStatus = newStatus;
          },
          () => {
            Swal.fire({
              title: 'Update Failed!',
              text: 'Failed to update user status. Please try again later.',
              icon: 'error',
              confirmButtonColor: '#FF5A5F',
            });
          }
        );
      }
    });
  }
 
 
  openMenu(event: Event, user: any): void {
    event.stopPropagation();
    this.activeUser = this.activeUser === user ? null : user;
  }
 
  // Close menu when clicking anywhere else
  @HostListener('document:click')
  closeMenu(): void {
    this.activeUser = null;
  }
 
 
  checkUserStatus(user: any): void {
    const checkStatusData = {
      CustomerId: user.leadWithDetails.LeadId, // Ensure this exists in personalInfo
      CompanyName: 'Virtuzone' // Ensure this exists in personalInfo
    };
 
    this.userService.checkStatus(checkStatusData).subscribe({
      next: (response: any) => {
        // Assume the response contains the updated KYC status in a property, e.g., response.kycStatus
        user.kycStatus = response.data.CustomerStatus;
        console.log('User KYC status updated:', user.kycStatus);
        // Optionally, update any UI elements or notify the user
      },
      error: (error) => {
        console.error('Error checking status:', error);
        // Optionally, handle the error (e.g., show a message to the user)
      }
    });
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
 