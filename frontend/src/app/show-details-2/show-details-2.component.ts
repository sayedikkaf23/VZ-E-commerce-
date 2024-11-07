import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // For toast notifications
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { DataStorageService } from '../service/data-storage.service'; // Import the service
import AOS from 'aos';
import { switchMap } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-show-details-2',
  templateUrl: './show-details-2.component.html',
  styleUrls: ['./show-details-2.component.css'] // Fixed styleUrls
})
export class ShowDetails2Component implements AfterViewInit { // Implement AfterViewInit interface
  isLoading = false;

  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
  bankInfo: any = {}; // To store bank service information (Step 2 data)
  salesforceResponse: any;
  quoteWithProductDetails: any;
 
  constructor(
    private http: HttpClient,
    private toastr: ToastrService, // For showing notifications
    private router: Router,
    private dataStorageService: DataStorageService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Check if the platform is a browser
  }


  ngOnInit(): void {


    this.salesforceResponse = this.dataStorageService.getSalesforceResponse();

    this.quoteWithProductDetails = this.salesforceResponse?.data?.quoteWithProductDetails;
    console.log( this.salesforceResponse,"salefoce",this.quoteWithProductDetails)
    // Ensure this code runs only in the browser environment
    if (this.isBrowser) {
      // Retrieve data from localStorage
      const step1Data = localStorage.getItem('step1Data');
      const step2Data = localStorage.getItem('step2Data');
    
  
      // If there is no data in localStorage, navigate away from this page
      if (!step1Data || !step2Data  ) {
        // this.toastr.warning('Required data not found. Please fill out the form first.', 'Warning');
        this.router.navigate(['/home']); // Replace with the correct route
      } else {
        // Parse and store data if it exists
        this.personalInfo = JSON.parse(step1Data);
        this.bankInfo = JSON.parse(step2Data);
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


  submitData() {
    const finalData = {
      ...this.personalInfo, // Merge personal information (Step 1 data)
      ...this.bankInfo // Merge bank information (Step 2 data)
    };
 
    // Send data to the backend using userService
    this.userService.uploadUserData(finalData).pipe(
      switchMap(response => {
        if (response.message) {
          // Clear localStorage after successful submission
          localStorage.removeItem('step1Data');
          localStorage.removeItem('step2Data');
 
 
          const quotePaymentId = this.salesforceResponse?.data?.quotePaymentWithDetails?.QuotePaymentId;
 
          if (quotePaymentId) {
            // Redirect to the payment URL
            const paymentUrl = `https://virtuzone.yeepeey.com/onlinepayment/${quotePaymentId}`;
            window.location.href = paymentUrl;
 
            // Return an observable to satisfy switchMap's requirement
            return of(null);
          } else {
            throw new Error('Quote Payment ID not found');
          }
        } else {
          throw new Error('Data submission failed'); // Handle case where response does not contain expected message
        }
      })
    ).subscribe(
      () => {},
      error => {
        // Show error toast on failure
        this.toastr.error(error.message || 'An error occurred', 'Error');
        console.error(error); // Log the error for debugging
      }
    );
  }


  
}
