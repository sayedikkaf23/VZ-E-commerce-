import { Component } from '@angular/core';

@Component({
  selector: 'app-users-sidebar',
  templateUrl: './users-sidebar.component.html',
  styleUrls: ['./users-sidebar.component.css']
})
export class UsersSidebarComponent {
  isSidebarOpen: boolean = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
