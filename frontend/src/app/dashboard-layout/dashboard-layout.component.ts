import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
// import { UserService } from '../services/user.service';
// import { NgxPermissionsService } from 'ngx-permissions';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router'; // Import RouterModule


@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
  encapsulation: ViewEncapsulation.Emulated,  // Default Angular encapsulation
  standalone: true,  // If DashboardLayoutComponent is also standalone
  imports: [HeaderComponent,RouterModule], // Import HeaderComponent

})
export class DashboardLayoutComponent implements OnInit {
  permissions: any = [];

  constructor(
    // public authSvc: AuthService,
    private router: Router,
    // private userService: UserService,
    // private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit(): void {
    // const token = this.authSvc.token;
    // if (!token) {
    //   localStorage.clear();
    //   // Swal.fire('Error', 'Please Login Again!', 'error');
    //   this.router.navigate(['/admin/login']);
    // } else {
    //   this.getUserPermissions();
    // }
  }

//   getUserPermissions() {
//     this.userService.getUserPermissions().subscribe({
//       next: (res: any) => {
//         localStorage.setItem('user_name', res?.data?.user_name);
//         this.userService.roleName = res?.data?.role_id?.role_name;
//         this.permissions = res?.data?.role_id?.permissions;
//         this.permissionsService.loadPermissions(this.permissions);
//       },
//       error: (err) => {
//         this.permissions = [];
//       },
//       complete: () => { },
//     });
//   }

  toggleSideBar() {
    const bodyElement = document.body;
    if (!bodyElement.classList.contains('sidebar-collapsein')) {
      bodyElement.classList.add('sidebar-collapsein');
    } else {
      bodyElement.classList.remove('sidebar-collapsein');
    }
  }

  get activeSetting() {
    return [
      '/panel/add_user',
      '/panel/users',
      '/panel/add_role',
      '/panel/roles',
      '/panel/settings',
      '/panel/accounts',
    ].includes(location.pathname);
  }

  get activeCustomerManagement() {
    return [
      '/panel/online_payment',
      '/panel/bank_transfer',
      '/panel/cheque_deposit',
      '/panel/cash_deposit',
      '/panel/card_machine',
      '/panel/cash_counter',
    ].includes(location.pathname);
  }
}
