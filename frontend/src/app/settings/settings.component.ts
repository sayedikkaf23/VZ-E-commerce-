import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service'; // Import the service

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  services: any[] = []; // This will hold the service data

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.getServices(); // Call the API on component initialization
  }

  // Method to fetch services from API
  getServices(): void {
    this.adminAuthService.getServices().subscribe(
      (response) => {
        console.log(response); // Check the API response
        this.services = response; // Assign response to services array
      },
      (error) => {
        console.error('Error fetching services:', error);
      }
    );
  }
}
