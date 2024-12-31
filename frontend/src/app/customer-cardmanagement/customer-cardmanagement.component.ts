import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

interface Service {
  name: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-customer-cardmanagement',
  templateUrl: './customer-cardmanagement.component.html',
  styleUrls: ['./customer-cardmanagement.component.css'], // Fix the styleUrls property
})
export class CustomerCardmanagementComponent implements OnInit {
  services: Service[] = []; // Initialize an empty array for services
  records: any[] = [];
  selectedRecord: any = null; // Initialize to null
  isSidebarActive = false;
  userName: string = ''; // Property to store the user's name


  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Current Route:', this.route.snapshot.url); // Check the current URL

    // Retrieve the email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      // Call the API with the email
      this.fetchUserServices(email);
      this.userName = this.extractNameFromEmail(email);
    } else {
      console.error('No email found in localStorage.');
    }
  }
  extractNameFromEmail(email: string): string {
    return email.split('@')[0]; // Get the part before the '@' symbol
  }
  ngAfterViewInit() {
    document.body.style.paddingTop = '0px';
    document.documentElement.style.paddingTop = '0px';
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  fetchUserServices(email: string): void {
    const payload = { email };

    this.userService.fetchUserServices(payload).subscribe(
      (response) => {
        if (response && response.data) {
          console.log('Response Data:', response.data);
          this.records = response.data;
        }
      },
      (error) => {
        console.error('Error fetching user services:', error);
      }
    );
  }

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }

  closeSidebar() {
    this.isSidebarActive = false;
  }

  viewDetails(record: any): void {
    this.selectedRecord = record; // Set the selected record
    const modalElement = document.getElementById('detailsModal');
    if (modalElement) {
      // Use the Bootstrap modal
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  navigateLogout(): void {
    this.router.navigate(['/login']); // Navigate to login
  }
}
