import { Component, OnInit } from '@angular/core';
import { VirtualManagementService } from '../service/virtual-management.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-virtual-management',
  templateUrl: './virtual-management.component.html',
  styleUrls: ['./virtual-management.component.css']
})
export class VirtualManagementComponent implements OnInit {
  clientList: any[] = []; // To store fetched client data
  selectedClientDetails: any[] = []; // To store selected client's shareholder details
  showModal: boolean = false; // Flag to control modal visibility
  hasSalaryData: boolean = false;
  hasCompanyNameData: boolean = false;
  userList: any[] = []; // To store the fetched user data
  loadingStatuses: { [key: string]: boolean } = {}; // To track loading state for each user
  showFileModal: boolean = false; // Flag for file modal
  selectedFiles: any[] = []; // To store selected files for the modal
  constructor(private virtualManagementService: VirtualManagementService) {}
 
  ngOnInit(): void {
    this.fetchClientDetails(); // Call the method when the component loads
  }
 
  fetchClientDetails(): void {
    this.virtualManagementService.getVirtaulData().subscribe(
      (response) => {
        this.clientList = response; // Assign the API response to the clientList array
        this.checkColumnData(); // Check columns only after data is loaded

      },
      (error) => {
        console.error('Error fetching client details:', error);
      }
    );
  }
  
  checkColumnData(): void {
    this.hasSalaryData = this.userList.some((user) => !!user.salary);
    this.hasCompanyNameData = this.userList.some((user) => !!user.companyname);
  }
  checkStatus(user: any): void {
    const payload = {
      CustomerId: user.leadWithDetails.LeadId,
      CompanyName: 'Virtuzone',
    };

    // Set loading state for the user
    this.loadingStatuses[user.leadWithDetails.LeadId] = true;

    this.virtualManagementService.checkStatus(payload).subscribe(
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
  openClientDetails(shareholders: any[]): void {
    console.log(shareholders)
    this.selectedClientDetails = shareholders; // Assign shareholder data to display in the modal
    this.showModal = true; // Open the modal
  }
 
  closeModal(): void {
    this.showModal = false; // Close the modal
  }
  openFileModal(files: any[]): void {
    if (files && files.length > 0) {
      this.selectedFiles = files; // Assign files to display in the modal
      this.showFileModal = true; // Open the modal
      console.log('Modal opened with files:', files); // Debugging
    } else {
      console.error('No files available for this client.');
    }
  }
  

  closeFileModal(): void {
    this.showFileModal = false; // Close the file modal
  }
}
 