import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard-layout',
  templateUrl: './user-dashboard-layout.component.html',
  styleUrls: ['./user-dashboard-layout.component.css']
})
export class UserDashboardLayoutComponent {
  permissions: any = [];

  constructor(private router: Router) {}

  toggleSideBar() {
    const bodyElement = document.body;
    if (!bodyElement.classList.contains('sidebar-collapsein')) {
      bodyElement.classList.add('sidebar-collapsein');
    } else {
      bodyElement.classList.remove('sidebar-collapsein');
    }
  }
}
