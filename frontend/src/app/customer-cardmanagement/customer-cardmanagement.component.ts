import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AddcardService } from '../service/addcard.service';


@Component({
  selector: 'app-customer-cardmanagement',
  templateUrl: './customer-cardmanagement.component.html',
  styleUrl: './customer-cardmanagement.component.css'
})
export class CustomerCardmanagementComponent {
  customerCards: any[] = [];
  customerName: string = ''; // Initialize to an empty string
  email: string = ''; // Initialize to an empty string

  customerId = "213";
  accountId = "2313";

  constructor(
    private router: Router,
    private addcardService: AddcardService
  ) {}

  ngOnInit() {
    this.loadCustomerCards();
    this.loadUserProfile();
  }

  loadCustomerCards() {
    this.addcardService.getCustomerCards(this.customerId,this.accountId).subscribe({
      next: (response: { data: any[]; }) => {
        console.log(response)
        this.customerCards = response.data;
     
      },
      error: (error: any) => {
        console.error('Error fetching customer cards', error);
        // Handle the error
      }
    });
  }

  loadUserProfile() {
    this.addcardService.getUserProfile(this.customerId).subscribe({
      next: (response: { data: string; }) => {
        // console.log(response);
        this.customerName = response.data;
        // console.log(this.customerName); // Add this line for debugging // Assuming 'name' is the property in the user profile
        this.email = response.data; // Assuming this is the email address
        // Extract the part before "@" from the email
        if (this.email.includes('@')) {
          const parts = this.email.split('@');
          if (parts.length === 2) {
            this.email = parts[0];
          }
        }
        // Handle the response and update UI
      },
      error: (error: any) => {
        console.error('Error fetching user profile', error);
        // Handle the error
      }
    });
  }

  navigateToAddCard() {
    this.router.navigate(['/customer/addcard']);
  }

  navigateLogout() {
    this.router.navigate([`/customerportal/signin/${this.accountId}`]);
  }
}
