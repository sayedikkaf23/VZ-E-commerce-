import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebars',
  templateUrl: './sidebars.component.html',
  styleUrls: ['./sidebars.component.css']
})
export class SidebarsComponent {
  // Add the isSidebarVisible property
  isSidebarVisible = false;  // Sidebar is hidden by default

  // Method to toggle sidebar visibility
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
