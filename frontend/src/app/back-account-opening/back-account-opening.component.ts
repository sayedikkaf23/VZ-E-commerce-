import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-back-account-opening',
  templateUrl: './back-account-opening.component.html',
  styleUrls: ['./back-account-opening.component.css'],
})
export class BackAccountOpeningComponent implements OnInit {
  userList: any[] = []; // To store the fetched user data
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;
  loadingStatuses: { [key: string]: boolean } = {}; // To track loading state for each user
  selectedAdditionalFiles: any[] = []; // To store the additional files for the modal
  showFileModal: boolean = false; // Control the visibility of the modal
  
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
  openFileModal(user: any): void {
    if (user.additionalUploadedFiles && user.additionalUploadedFiles.length > 0) {
      this.selectedAdditionalFiles = user.additionalUploadedFiles; // Assign files to display in the modal
      this.showFileModal = true; // Open the modal
    } else {
      console.warn('No additional files available for this user.');
    }
  }
  
  closeFileModal(): void {
    this.showFileModal = false; // Close the modal
    this.selectedAdditionalFiles = []; // Clear the files
  }
  
  isImage(fileName: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }
  
}
