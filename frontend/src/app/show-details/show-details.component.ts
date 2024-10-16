import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID ,HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // For toast notifications
import { UserService } from '../service/user.service';

import { Router } from '@angular/router';
import AOS from 'aos';

declare var $: any;

@Component({
  selector: 'app-show-details',
  templateUrl: './show-details.component.html',
  styleUrls: ['./show-details.component.css'] // Correct styleUrls syntax
})
export class ShowDetailsComponent implements AfterViewInit {

  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
  bankInfo: any = {}; // To store bank service information (Step 2 data)

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
    // Retrieve data from localStorage
    const step1Data = localStorage.getItem('step1Data');
    const step2Data = localStorage.getItem('step2Data');

    if (step1Data) {
      this.personalInfo = JSON.parse(step1Data); // Parse and store Step 1 data
    }

    if (step2Data) {
      this.bankInfo = JSON.parse(step2Data); // Parse and store Step 2 data
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
    const finalData = {
      ...this.personalInfo, // Merge personal information (Step 1 data)
      ...this.bankInfo // Merge bank information (Step 2 data)
    };
  
    // Send data to the backend using userService
    this.userService.uploadUserData(finalData).subscribe(
      response => {
        if (response.message) {
          // Show success toast on successful data submission
          this.toastr.success('Data submitted successfully!', 'Success');
  
          // Clear localStorage after successful submission
          localStorage.removeItem('step1Data');
          localStorage.removeItem('step2Data');
  
          // Optionally, navigate to another page (e.g., a thank-you or confirmation page)
          this.router.navigate(['/home']);
        }
      },
      error => {
        // Show error toast on failure
        this.showError(error.error.message);
        console.error(error); // Log the error for debugging
      }
    );
  }
  
}
