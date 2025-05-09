import { Component } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';

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
  constructor(private menuService: AdminAuthService) {}

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


  toggleSubMenu() {
    this.isSubMenuOpen = !this.isSubMenuOpen;
  }
}