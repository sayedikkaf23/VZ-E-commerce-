import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // For toast notifications
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import AOS from 'aos';
import { switchMap } from 'rxjs';

declare var $: any;


@Component({
  selector: 'app-virtual-receptionist-details',
  templateUrl: './virtual-receptionist-details.component.html',
  styleUrl: './virtual-receptionist-details.component.css'
})
export class VirtualReceptionistDetailsComponent {

  showAll = false;
  displayShareholders :any= [];
  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
 companyInfo: any = {}; // To store bank service information (Step 2 data)
 shareholders :any= [];
 uploadedFiles: File[][] = []; // Initialize as an empty array
 constructor(
    private http: HttpClient,
    private toastr: ToastrService, // For showing notifications
    private router: Router,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Check if the platform is a browser
  }

  ngOnInit(): void {
    // Check if code is running in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Retrieve data from localStorage
      const mailform = localStorage.getItem('virtualdata');
      const mailform2 = localStorage.getItem('virtualdata1');
      const mailform3 = localStorage.getItem('virtualdata2');
  
      // If required data is missing, navigate away from the page
      if (!mailform || !mailform2 || !mailform3) {
        this.router.navigate(['/home']); // Navigate to home if any data is missing
      } else {
        // Parse each data item from localStorage
        this.personalInfo = JSON.parse(mailform);
        this.companyInfo = JSON.parse(mailform2);
        const additionalShareholderInfo = JSON.parse(mailform3);
  
        // Merge shareholder information
        const mergedShareholders = this.companyInfo.shareholders.map((shareholder: any, index: string | number) => {
          const additionalInfo = additionalShareholderInfo.shareholders[index];
          return {
            ...shareholder,
            passportNumber: additionalInfo.passportNumber,
            files: additionalInfo.files
          };
        });
  
        // Create the merged data object
        const mergedData = {
          ...this.personalInfo,
          ...this.companyInfo,
          companyTradeLicense: additionalShareholderInfo.companyTradeLicense,
          shareholders: mergedShareholders
        };
  
        // Optionally store the merged data in localStorage
        localStorage.setItem('mergedData', JSON.stringify(mergedData));
  
        // Use the merged data directly if needed
        this.displayShareholders = mergedData.shareholders.slice(0, 5); // Show only 5 shareholders initially
        console.log('Merged Data:', mergedData);
      }
    }
  }
  
  

  ngAfterViewInit(): void {
    if (this.isBrowser) {  // Ensure AOS and jQuery code runs only in the browser
      AOS.init();

      $(window).scroll(function () {
        const height = $(window).scrollTop();
        if (height > 50) {
          $('html').addClass('sticky');
        } else {
          $('html').removeClass('sticky');
        }
      });

      $(document).ready(() => {
        $('.scrollToTop').click(function (event: any) {
          event.preventDefault();
          $('html, body').animate({ scrollTop: 0 }, 'slow');
          return false;
        });

        $('.navbar-toggle').click(function () {
          $('html').toggleClass('menu-show');
        });

        $('.header-menu-overlay').click(function () {
          $('html').removeClass('menu-show');
        });

        $('.sub-menu-toggle').click(() => {
          $(this).parent().toggleClass('submenu_active');
        });
      });
    }
  }

  // Call this function when there's an error
  showError(errorMessage: string): void {
    this.toastr.error(errorMessage || 'Error submitting data', 'Error', {
      positionClass: this.getToastPosition()
    });
  }

  // Dynamically adjust the toastr position based on user scrolling
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    console.log(scrollPosition); // You can log this to see how far the user has scrolled
  }

  // Function to determine the toast position based on scroll
  getToastPosition(): string {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    return scrollPosition > 100 ? 'toast-bottom-right' : 'toast-bottom-left'; // Adjust based on scroll
  }

  // Submit data to backend and clear localStorage
  submitData() {
    // Retrieve merged data from localStorage
    const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');
  
    // Create a FormData object to hold all form data and files
    const formData = new FormData();
  
    // Append general data fields from `mergedData`, excluding `shareholders`
    for (const key in mergedData) {
      if (mergedData.hasOwnProperty(key) && key !== 'shareholders') {
        const value = mergedData[key];
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }
  
    // Append shareholders' data and files to FormData
    mergedData.shareholders.forEach((shareholder: any, index: number) => {
      // Append each field in the shareholder data (excluding files)
      for (const field in shareholder) {
        if (field !== 'files') {
          formData.append(`shareholders[${index}][${field}]`, shareholder[field]);
        }
      }
  
      // Append each file for the current shareholder
      if (Array.isArray(this.uploadedFiles[index])) {
        this.uploadedFiles[index].forEach((file: File) => {
          formData.append(`shareholderFiles[${index}]`, file); // Append each file with a unique key
        });
      }
    });
  
    // Send data to the backend using UserService
    this.userService.virtualform(formData).subscribe(
      response => {
        console.log('Data submitted successfully:', response);
        // Clear localStorage after successful submission
        localStorage.removeItem('virtualdata');
        localStorage.removeItem('virtualdata1');
        localStorage.removeItem('virtualdata2');
        localStorage.removeItem('mergedData');
      },
      error => {
        console.error('Error submitting data:', error);
        this.showError(error.error.message || 'An error occurred');
      }
    );
  }
  
  
  
  


  toggleView() {
    this.showAll = !this.showAll;
    this.displayShareholders = this.showAll ? this.shareholders : this.shareholders.slice(0, 5);
  }
}

