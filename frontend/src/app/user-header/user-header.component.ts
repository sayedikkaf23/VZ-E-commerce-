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

  menuItems: MenuItem[] = [];

  constructor(private menuService: AdminAuthService) {}

  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe(
      (items) => this.menuItems = items,
      (error) => console.error('Error loading menu items', error)
    );
  }
}