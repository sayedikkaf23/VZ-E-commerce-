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
  selector: 'app-service-page',
  templateUrl: './service-page.component.html',
  styleUrls: ['./service-page.component.css']
})
export class ServicePageComponent implements OnInit {
  services: Service[] = []; // Initialize an empty array for services

  constructor(private userService: UserService,private route: ActivatedRoute,private router: Router) {}

  ngOnInit(): void {
    console.log("rouerttyy",this.route.snapshot.url); // Check the current URL

    // Retrieve the email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      // Call the API with the email
      this.fetchUserServices(email);
    } else {
      console.error('No email found in localStorage.');
    }
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
          this.services = response.data.map((item: any) => ({
            name: item.leadWithDetails?.Company || 'No company name provided',
            description: item.quoteWithProductDetails?.product[0]?.productName || 'No description available',
            status: item.leadWithDetails?.Status || 'Unknown'
          }));
        }
      },
      (error) => {
        console.error('Error fetching user services:', error);
      }
    );
  }
}
