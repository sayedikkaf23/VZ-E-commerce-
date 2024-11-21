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
  // Dummy data for shareholders
  dummyShareholders = [
    { name: 'John Doe', id: 'SH001', percentage: 25 },
    { name: 'Jane Smith', id: 'SH002', percentage: 35 },
    { name: 'Robert Wilson', id: 'SH003', percentage: 40 }
  ];
  loadingStatuses: { [key: string]: boolean } = {}; // To track loading state for each user

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserDetails(); // Call the method when the component loads
  }

  fetchUserDetails(): void {
    this.adminAuthService.getBusinessBank().subscribe(
      (response) => {
        this.userList = response; // Assign the API response to the userList array
        this.checkColumnData(); // Check columns only after data is loaded

      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  checkColumnData(): void {
    this.hasSalaryData = this.userList.some((user) => !!user.salary);
    this.hasCompanyNameData = this.userList.some((user) => !!user.companyname);
  }

  // Method to call checkStatus API and store CaseStatusCode
  checkStatus(user: any): void {
    const payload = {
      CustomerId: user.LeadId,
      CompanyName: 'Virtuzone',
    };

    // Set loading state for the user
    this.loadingStatuses[user.LeadId] = true;

    this.adminAuthService.checkStatus(payload).subscribe(
      (response) => {
        user.CustomerStatus = response.data?.CustomerStatus; // Store CaseStatusCode in user
        console.log('Status check response:', response);
      },
      (error) => {
        console.error('Error checking status:', error);
      },
      () => {
        // Clear loading state for the user
        this.loadingStatuses[user.LeadId] = false;
      }
    );
  }
  
  openModal(data:any): void {
    this.selectedUserShareholders = data; // Assign dummy data directly
    this.showModal = true; // Open the modal
  }

  closeModal(): void {
    this.showModal = false;
  }
}
