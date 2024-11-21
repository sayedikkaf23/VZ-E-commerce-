import { Component, OnInit } from '@angular/core';
import { MailManagementService } from '../service/mail-management.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-admin-mail-management',
  templateUrl: './admin-mail-management.component.html',
  styleUrl: './admin-mail-management.component.css',
})
export class AdminMailManagementComponent {
  mailList: any[] = []; // To store fetched mail data
  selectedMailDetails: any[] = []; // To store selected mail details
  showModal: boolean = false; // Flag to control modal visibility
  userList: any[] = []; // To store the fetched user data
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;
  loadingStatuses: { [key: string]: boolean } = {}; // To track loading state for each user

  constructor(private mailManagementService: MailManagementService) {}

  ngOnInit(): void {
    this.fetchMailDetails(); // Call the method when the component loads
  }

  fetchMailDetails(): void {
    this.mailManagementService.getVirtaulData().subscribe(
      (response) => {
        this.mailList = response; // Assign the API response to the mailList array
        this.checkColumnData(); // Check columns only after data is loaded
      },
      (error) => {
        console.error('Error fetching mail details:', error);
      }
    );
  }

  checkColumnData(): void {
    this.hasSalaryData = this.userList.some((user) => !!user.salary);
    this.hasCompanyNameData = this.userList.some((user) => !!user.companyname);
  }
  checkStatus(user: any): void {
    const payload = {
      CustomerId: user.LeadId,
      CompanyName: 'Virtuzone',
    };

    // Set loading state for the user
    this.loadingStatuses[user.LeadId] = true;

    this.mailManagementService.checkStatus(payload).subscribe(
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
  openMailDetails(details: any): void {
    this.selectedMailDetails = details; // Assign mail details data directly
    this.showModal = true; // Open the modal
  }

  closeModal(): void {
    this.showModal = false; // Close the modal
  }
}
