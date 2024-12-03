import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface MenuItem {
  name: string;
  link: string;
}
@Component({
  selector: 'app-client-header',
  templateUrl: './client-header.component.html',
  styleUrl: './client-header.component.css'
})
export class ClientHeaderComponent {
  constructor(
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID
  ) {}

  ngOnInit(): void {}

  back() {
    history.back();
  }

  toggleSideBar() {
    const bodyElement = document.body;
    bodyElement.classList.toggle('sidebar-collapsein');
  }

  // logOut() {
  //   localStorage.clear();
  //   if (isPlatformBrowser(this.platformId)) {
  //     location.href = '/admin/login';
  //     location.reload();
  //   }
  // }
  logOut() {
    // Clear local storage
    localStorage.clear();
    
    // Check if we are in the browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Use Angular Router to navigate to /admin/login
      this.router.navigate(['/login']).then(() => {
        // Optionally, you can reload the page if needed
        location.reload();
      });
    }
  }
  
  // Check if this is the browser environment and return location information accordingly
  get isDashboardNavShow() {
    if (isPlatformBrowser(this.platformId)) {
      const routes = ['/panel/dashboard'];
      return routes.includes(location.pathname);
    }
    return false;
  }

  get isReportsNavShow() {
    if (isPlatformBrowser(this.platformId)) {
      const routes = ['/panel/reports'];
      return routes.includes(location.pathname);
    }
    return false;
  }

  get isSettingsNavShow() {
    if (isPlatformBrowser(this.platformId)) {
      const routes = [
        '/panel/settings',
        '/panel/roles',
        '/panel/add_role',
        '/panel/users',
        '/panel/add_user',
        '/panel/accounts',
        '/panel/sidebars',
      ];
      return routes.includes(location.pathname);
    }
    return false;
  }

  get activeUser() {
    if (isPlatformBrowser(this.platformId)) {
      return ['/panel/users', '/panel/add_user'].includes(location.pathname);
    }
    return false;
  }

  get activeRole() {
    if (isPlatformBrowser(this.platformId)) {
      return ['/panel/roles', '/panel/add_role'].includes(location.pathname);
    }
    return false;
  }

  get activeSideBar() {
    if (isPlatformBrowser(this.platformId)) {
      return ['/panel/sidebars'].includes(location.pathname);
    }
    return false;
  }

  get isCustomersNavShow() {
    if (isPlatformBrowser(this.platformId)) {
      const routes = ['/panel/transactions'];
      return routes.includes(location.pathname);
    }
    return false;
  }

  get activeCustomer() {
    if (isPlatformBrowser(this.platformId)) {
      return ['/panel/transactions'].includes(location.pathname);
    }
    return false;
  }

  get isPaymentModeNavShow() {
    if (isPlatformBrowser(this.platformId)) {
      const routes = ['/panel/payment_modes', '/panel/add_payment_mode'];
      return routes.includes(location.pathname);
    }
    return false;
  }

  get activePaymentMode() {
    if (isPlatformBrowser(this.platformId)) {
      return ['/panel/payment_modes', '/panel/add_payment_mode'].includes(
        location.pathname
      );
    }
    return false;
  }

  get isPaymentMethodNavShow() {
    if (isPlatformBrowser(this.platformId)) {
      const routes = ['/panel/payment_methods'];
      return routes.includes(location.pathname);
    }
    return false;
  }

  get isCustomerMangementNavShow() {
    if (isPlatformBrowser(this.platformId)) {
      const routes = [
        '/panel/online_payment',
        '/panel/bank_transfer',
        '/panel/cheque_deposit',
        '/panel/cash_deposit',
        '/panel/card_machine',
        '/panel/cash_counter',
      ];
      return routes.includes(location.pathname);
    }
    return false;
  }
  get isBankMangementNavShow() {
    if (isPlatformBrowser(this.platformId)) {
      const routes = [
     
        '/panel/PersonalBank-account-opening',
        '/panel/business-bank-account',
   
      ];
      return routes.includes(location.pathname);
    }
    return false;
  }

  get activeCustomerMangement() {
    if (isPlatformBrowser(this.platformId)) {
      return [
        '/panel/online_payment',
        '/panel/bank_transfer',
        '/panel/cheque_deposit',
        '/panel/cash_deposit',
        '/panel/card_machine',
        '/panel/cash_counter',
      ].includes(location.pathname);
    }
    return false;
  }
}