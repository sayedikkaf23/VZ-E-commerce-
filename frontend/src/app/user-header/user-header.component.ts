import { Component } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';
import { Router } from '@angular/router';

interface MenuItem {
  name: string;
  link: string;
}

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrl: './user-header.component.css'
})
export class UserHeaderComponent {
  isMobileSidebarOpen = false;
  menuItems: MenuItem[] = [];

  isSubMenuOpen = false;
  isLoading = false;
  constructor(private menuService: AdminAuthService,private router: Router,) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.menuService.getMenuItems().subscribe(
      (items) => this.menuItems = items,
      (error) => console.error('Error loading menu items', error)
    );
    this.isLoading = false;
  }


  onDropdownClick(event: MouseEvent) {
    if (window.innerWidth <= 991) {
      event.preventDefault();  // Prevent default navigation behavior
      event.stopPropagation(); // Prevent bubbling
      this.isSubMenuOpen = !this.isSubMenuOpen;
    }
  }
  
  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    if (!this.isMobileSidebarOpen) {
      this.isSubMenuOpen = false;
    }
  }

startNow(check: any): void {

  console.log(check)
  if (check === 'Bank Account Opening') {
    this.router.navigate(['/step-1']);
  } else if (check === 'Accounting & VAT') {
    this.router.navigate(['/service-b']);
  } else if (check === 'Mail Management') {
    this.router.navigate(['/mails-management']);
  } else if (check === 'Virtual Receptionist') {
    this.router.navigate(['/virtual-receptionist']);
  } else if (check === 'Mail Management') {
    this.router.navigate(['/mailform']);
  } else {
    this.router.navigate(['/default']);
  }
}

  toggleSubMenu() {
    this.isSubMenuOpen = !this.isSubMenuOpen;
  }
}