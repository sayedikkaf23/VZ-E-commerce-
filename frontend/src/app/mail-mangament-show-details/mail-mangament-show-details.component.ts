import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // For toast notifications
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import AOS from 'aos';
import { switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { DataStorageService } from '../service/data-storage.service'; // Import the service
import { MatchScoreStorageService } from '../service/matchscore-storage.service';


declare var $: any;
@Component({
  selector: 'app-mail-mangament-show-details',
  templateUrl: './mail-mangament-show-details.component.html',
  styleUrl: './mail-mangament-show-details.component.css'
})
export class MailMangamentShowDetailsComponent {
  isLoading = false;
  showAll = false;
  displayShareholders :any= [];
  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
  companyInfo: any = {}; // To store bank service information (Step 2 data)
  shareholders :any= [];
  
  constructor(
    private http: HttpClient,
    private toastr: ToastrService, // For showing notifications
    private router: Router,
    private userService: UserService,
    private dataStorageService: DataStorageService,
    private matchScoreStorageService: MatchScoreStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Check if the platform is a browser
  }

  ngOnInit(): void {


    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    // Ensure this code runs only in the browser environment
    if (this.isBrowser) {
      // Retrieve data from localStorage
   
      const mailform = localStorage.getItem('step1Data');
      const mailform2 = localStorage.getItem('mailform2');
  console.log(mailform2,"sssss")
      // If there is no data in localStorage, navigate away from this page
      if ( !mailform || !mailform2 ) {
        // this.toastr.warning('Required data not found. Please fill out the form first.', 'Warning');
        this.router.navigate(['/home']); // Replace with the correct route
      } else {
        // Parse and store data if it exists
        this.personalInfo = JSON.parse(mailform);
        this.companyInfo = JSON.parse(mailform2);
        this.shareholders=this.companyInfo.shareholders
        this.displayShareholders = this.shareholders.slice(0, 5);  // Show only 5 initially
        console.log(  this.displayShareholders)

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
  // submitData() {
  //   const finalData = {
  //     ...this.personalInfo, // Merge personal information (Step 1 data)
  //     ...this.companyInfo // Merge bank information (Step 2 data)
  //   };
  
  //   // Send data to the backend using userService
  //   this.userService.uploadUserData(finalData).pipe(
  //     switchMap(response => {
  //       if (response.message) {
  //         // Clear localStorage after successful submission
  //         localStorage.removeItem('mailform');
  //         localStorage.removeItem('mailform2');

  //         // Call payNowByStripe with the necessary payload
  //         const stripePayload = { amount: 135, currency: 'USD' }; // Example payload, replace with your actual data
  //         return this.userService.payNowByStripe(stripePayload);
  //       } else {
  //         throw new Error('Data submission failed'); // Handle case where response does not contain expected message
  //       }
  //     })
  //   ).subscribe(
  //     payNowResponse => {
  //       // Assuming the response contains a URL to redirect for payment
  //       const paymentUrl = payNowResponse.stripeData.url; // Replace 'url' with the actual field name from the response

  //       if (paymentUrl) {
  //         // Navigate to the payment URL
  //         window.location.href = paymentUrl; // Redirecting the browser to the payment page
  //       } else {
  //         this.toastr.error('Payment URL not found', 'Error');
  //       }
  //     },
  //     error => {
  //       // Show error toast on failure
  //       this.showError(error.error.message || 'An error occurred');
  //       console.error(error); // Log the error for debugging
  //     }
  //   );
  // }


  submitData() {
    // Combine personalInfo and bankInfo into finalData
    const finalData = {
      ...this.personalInfo, // Merge personal information (Step 1 data)
      ...this.companyInfo // Merge bank information (Step 2 data)
    };
  
    // Show a SweetAlert confirmation dialog
    Swal.fire({
      title: 'Confirm Your Data',
      text: 'Once you proceed to the next step, you won’t be able to edit your information. Please confirm your data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FA2E52',
      confirmButtonText: 'Yes, I confirm',
      cancelButtonText: 'Review Data'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          email: finalData.email,
          nationality: finalData.nationality,
          phone: finalData.mobileNumber, // Ensure to map this correctly
          dob: finalData.birthday,
          service: "Bank_opening",
          CustomerType:  finalData.CustomerType,
          shareholders:  this.shareholders,
        };
  
        this.isLoading = true; // Show loading indicator if necessary
  
        // First API call to callSalesforceEndpoint
        this.userService.callSalesforceEndpoint(payload).pipe(
          switchMap((response: any) => {
            console.log('Salesforce Response:', response);
            this.dataStorageService.setSalesforceResponse(response);
            // Prepare payload for the second API call
            const quotePayload = {
              lead_source: response.data.leadWithDetails.LeadSource,
              currencyCode: response.data.quotePaymentWithDetails.Currency, // Update this as needed
              quotePaymentId: response.data.quotePaymentWithDetails.QuotePaymentId, // Assuming the response has quotePaymentId
              account_id: response.data.quotePaymentWithDetails.AccountId, // Assuming the response has account_id
              payment_url: `https://ecommerce.yeepeey.com/onlinepayment/${response.data.quotePaymentWithDetails.QuotePaymentId}`
            };
            // Call the second API
            return this.userService.callSalesforceQuoteService(quotePayload).pipe(
              switchMap((quoteResponse: any) => {
                console.log('Quote Service Response:', quoteResponse);
  
                // Prepare payload for MatchScoreProductService
                const matchScorePayload = {
                  quotePaymentId: quotePayload.quotePaymentId,
                  accountId: quotePayload.account_id,
                  leadId: response.data.leadWithDetails.LeadId, // Assuming leadId is part of the response
                  matchScore: response.screeningmatchScore.matchScore, // Adjust based on response structure
                };
  
                // Call the third API
                return this.userService.MatchScoreProductService(matchScorePayload);
              })
            );
          })
        ).subscribe(
          (quoteResponse: any) => {
            console.log('Quote Service Response:', quoteResponse);
            this.isLoading = false; // Hide loader
  
            // Save finalData in localStorage
            localStorage.setItem('finalDatabussiness', JSON.stringify(finalData));

            this.matchScoreStorageService.setMatchScoreResponse(quoteResponse);
            // Navigate to the next step
            this.router.navigate(['/bussiness-show-details']); // Replace with your actual route
          },
          (error) => {
            // Handle errors from the Salesforce API calls
            Swal.fire('Error', 'There was an error processing your request. Please try again.', 'error');
            console.error(error);
            localStorage.clear();
            this.router.navigate(['/']); // Replace with your actual route
            this.isLoading = false; // Hide loader in case of error
          }
        );
      }
      // No action needed if the user cancels the confirmation
    });
  }
  


  toggleView() {
    this.showAll = !this.showAll;
    this.displayShareholders = this.showAll ? this.shareholders : this.shareholders.slice(0, 5);
  }
}
