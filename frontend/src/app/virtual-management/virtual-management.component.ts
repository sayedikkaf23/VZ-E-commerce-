import { Component, OnInit } from '@angular/core';
import { VirtualManagementService } from '../service/virtual-management.service';
 
@Component({
  selector: 'app-virtual-management',
  templateUrl: './virtual-management.component.html',
  styleUrls: ['./virtual-management.component.css']
})
export class VirtualManagementComponent implements OnInit {
  clientList: any[] = []; // To store fetched client data
  selectedClientDetails: any[] = []; // To store selected client's shareholder details
  showModal: boolean = false; // Flag to control modal visibility
 
  constructor(private virtualManagementService: VirtualManagementService) {}
 
  ngOnInit(): void {
    this.fetchClientDetails(); // Call the method when the component loads
  }
 
  fetchClientDetails(): void {
    this.virtualManagementService.getVirtaulData().subscribe(
      (response) => {
        this.clientList = response; // Assign the API response to the clientList array
      },
      (error) => {
        console.error('Error fetching client details:', error);
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
}
 