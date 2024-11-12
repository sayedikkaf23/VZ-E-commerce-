import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';

@Component({
  selector: 'app-back-account-opening',
  templateUrl: './back-account-opening.component.html',
  styleUrls: ['./back-account-opening.component.css'],
})
export class BackAccountOpeningComponent implements OnInit {
  userList: any[] = []; // To store the fetched user data
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserDetails(); // Call the method when the component loads
  }

  fetchUserDetails(): void {
    this.adminAuthService.getPersonalBank().subscribe(
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
    this.adminAuthService.checkStatus(payload).subscribe(
      (response) => {
        user.CustomerStatus = response.data?.CustomerStatus; // Store CaseStatusCode in user
        console.log('Status check response:', response);
      },
      (error) => {
        console.error('Error checking status:', error);
      }
    );
  }
}
