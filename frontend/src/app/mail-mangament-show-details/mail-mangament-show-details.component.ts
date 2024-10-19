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
  selector: 'app-mail-mangament-show-details',
  templateUrl: './mail-mangament-show-details.component.html',
  styleUrl: './mail-mangament-show-details.component.css'
})
export class MailMangamentShowDetailsComponent {
 
  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
 companyInfo: any = {}; // To store bank service information (Step 2 data)

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
    // Ensure this code runs only in the browser environment
    if (this.isBrowser) {
      // Retrieve data from localStorage
   
      const mailform = localStorage.getItem('step1Data');
      const mailform2 = localStorage.getItem('mailform2');
  
      // If there is no data in localStorage, navigate away from this page
      if ( !mailform || !mailform2 ) {
        // this.toastr.warning('Required data not found. Please fill out the form first.', 'Warning');
        this.router.navigate(['/home']); // Replace with the correct route
      } else {
        // Parse and store data if it exists
        this.personalInfo = JSON.parse(mailform);
        this.companyInfo = JSON.parse(mailform2);
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
    const finalData = {
      ...this.personalInfo, // Merge personal information (Step 1 data)
      ...this.companyInfo // Merge bank information (Step 2 data)
    };
  
    // Send data to the backend using userService
    this.userService.uploadUserData(finalData).pipe(
      switchMap(response => {
        if (response.message) {
          // Clear localStorage after successful submission
          localStorage.removeItem('mailform');
          localStorage.removeItem('mailform2');

          // Call payNowByStripe with the necessary payload
          const stripePayload = { amount: 135, currency: 'USD' }; // Example payload, replace with your actual data
          return this.userService.payNowByStripe(stripePayload);
        } else {
          throw new Error('Data submission failed'); // Handle case where response does not contain expected message
        }
      })
    ).subscribe(
      payNowResponse => {
        // Assuming the response contains a URL to redirect for payment
        const paymentUrl = payNowResponse.stripeData.url; // Replace 'url' with the actual field name from the response

        if (paymentUrl) {
          // Navigate to the payment URL
          window.location.href = paymentUrl; // Redirecting the browser to the payment page
        } else {
          this.toastr.error('Payment URL not found', 'Error');
        }
      },
      error => {
        // Show error toast on failure
        this.showError(error.error.message || 'An error occurred');
        console.error(error); // Log the error for debugging
      }
    );
  }
}
