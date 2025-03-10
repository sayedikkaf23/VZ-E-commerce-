import { Component, OnInit, HostListener } from '@angular/core';

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


  constructor(private adminAuthService: AdminAuthService) { }

  ngOnInit(): void {
    this.fetchUserDetails();
  }

  fetchUserDetails(): void {
    this.isLoading=true
    this.adminAuthService.getUserDetails().subscribe(
      (response) => {
        this.userList = response;
        this.filteredUserList = [...this.userList];
      },
      (error) => {
        console.error('Error fetching user details:', error);
      },
      ()=>{
        this.isLoading=false
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
        (`${user.leadWithDetails.FirstName || ''} ${user.leadWithDetails.LastName || ''}`)
          .trim().toLowerCase().includes(this.searchTerm) ||
        (user.leadWithDetails.Email && user.leadWithDetails.Email.toLowerCase().includes(this.searchTerm)) ||
        (user.leadWithDetails.Nationality && user.leadWithDetails.Nationality.toLowerCase().includes(this.searchTerm)) ||
        (user.birthday && user.birthday.includes(this.searchTerm)) ||
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

