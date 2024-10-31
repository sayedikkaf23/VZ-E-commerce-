import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';

@Component({
  selector: 'app-admin-mail-management',
  templateUrl: './admin-mail-management.component.html',
  styleUrl: './admin-mail-management.component.css'
})
export class AdminMailManagementComponent {

  mailList: any[] = []; // To store fetched mail data
  selectedMailDetails: any[] = []; // To store selected mail details
  showModal: boolean = false; // Flag to control modal visibility

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchMailDetails(); // Call the method when the component loads
  }

  fetchMailDetails(): void {
    this.adminAuthService.getBusinessBank().subscribe(
      (response) => {
        this.mailList = response; // Assign the API response to the mailList array
      },
      (error) => {
        console.error('Error fetching mail details:', error);
      }
    );
  }

  openMailDetails(details: any): void {
    this.selectedMailDetails = details; // Assign mail details data directly
    this.showModal = true; // Open the modal
  }

  closeModal(): void {
    this.showModal = false;
  }
}