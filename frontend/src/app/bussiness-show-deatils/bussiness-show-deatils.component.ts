import { isPlatformBrowser, Location } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { DataStorageService } from '../service/data-storage.service';
import AOS from 'aos';
import { switchMap, of } from 'rxjs';
import Swal from 'sweetalert2';
import { MatchScoreStorageService } from '../service/matchscore-storage.service';

declare var $: any;

@Component({
  selector: 'app-bussiness-show-deatils',
  templateUrl: './bussiness-show-deatils.component.html',
  styleUrl: './bussiness-show-deatils.component.css'
})
export class BussinessShowDeatilsComponent {
  isLoading = false;
  isBrowser: boolean;
  personalInfo: any = {};
  bankInfo: any = {};
  salesforceResponse: any;
  quoteWithProductDetails: any;
  matchScoreResponse: any;
  showAll = false;
  displayShareholders :any= [];
totalDiscount: number = 0;
totalVat: number = 0;

  companyInfo: any = {}; // To store bank service information (Step 2 data)
  shareholders :any= [];
  
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private dataStorageService: DataStorageService,
    private userService: UserService,
    private matchScoreStorageService: MatchScoreStorageService,

    @Inject(PLATFORM_ID) private platformId: Object,
    private location: Location // Inject Location service
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
    this.salesforceResponse = this.dataStorageService.getSalesforceResponse();
    // this.quoteWithProductDetails = this.salesforceResponse?.data?.quoteWithProductDetails;
    this.matchScoreResponse = this.matchScoreStorageService.getMatchScoreResponse();
    this.quoteWithProductDetails = this.matchScoreResponse?.data;
    // Check if the salesforceResponse is empty or null
  //   if (!this.salesforceResponse) {
  //     Swal.fire({
  //       title: 'Session Expired',
  //       text: 'Your session has expired. Please complete the form again from the beginning.',
  //       icon: 'warning',
  //       confirmButtonText: 'OK',
  //        confirmButtonColor: '#FF5A5F'
  //     }).then((result) => {
  //       if (result.value) {
  //         localStorage.removeItem('step1Data');
  //         localStorage.removeItem('mailform');
  //         localStorage.removeItem('mailform2');
  //         localStorage.removeItem('finalDatabussiness');


  //         this.router.navigate(['/home']);  // Navigate to the start of the form
  //       }
  //     });
  //   } else if (this.isBrowser) {
  //     // Retrieve data from localStorage
   
  //     const mailform = localStorage.getItem('step1Data');
  //     const mailform2 = localStorage.getItem('mailform2');
  // // console.log(mailform2,"sssss")
  //     // If there is no data in localStorage, navigate away from this page
  //     if ( !mailform || !mailform2 ) {
  //       // this.toastr.warning('Required data not found. Please fill out the form first.', 'Warning');
  //       this.router.navigate(['/home']); // Replace with the correct route
  //     } else {
  //       // Parse and store data if it exists
  //       this.personalInfo = JSON.parse(mailform);
  //       this.companyInfo = JSON.parse(mailform2);
  //       this.shareholders=this.companyInfo.shareholders
  //       this.displayShareholders = this.shareholders.slice(0, 5);  // Show only 5 initially
  //       // console.log(  this.displayShareholders)
        

  //     }
  //   }
  if(this.isBrowser) {
    const step1Data = localStorage.getItem('step1Data');
    const mailform2 = localStorage.getItem('mailform2');

    if (!step1Data || !mailform2) {
      this.router.navigate(['/home']);  // Navigate to home if there's no data
    } else {
      this.personalInfo = JSON.parse(step1Data);
      this.bankInfo = JSON.parse(mailform2);

      // Prevent back navigation
      this.preventBackNavigation();
    }
  }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
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

  preventBackNavigation() {
    // Push the current route to history to prevent back navigation
    history.pushState(null, '', this.router.url);
  
    // Listen for 'popstate' events to block back navigation
    window.addEventListener('popstate', (event) => {
      history.pushState(null, '', this.router.url);
      // Display an optional warning message
      this.toastr.error('Back navigation is disabled on this page.', 'Warning');
      // Reload the page to reset the state
      setTimeout(() => {
        window.location.reload();
      }, 50);
    });
  }
  
  // submitData() {
  //   const finalData = {
  //     ...this.personalInfo,
  //     ...this.bankInfo
  //   };

  //   this.userService.uploadUserData(finalData).pipe(
  //     switchMap(response => {
  //       if (response.message) {
  //         localStorage.removeItem('step1Data');
  //         localStorage.removeItem('step2Data');

  //         const quotePaymentId = this.salesforceResponse?.data?.quotePaymentWithDetails?.QuotePaymentId;

  //         if (quotePaymentId) {
  //           const paymentUrl = `https://virtuzone.yeepeey.com/onlinepayment/${quotePaymentId}`;
  //           window.location.href = paymentUrl;
  //           return of(null);
  //         } else {
  //           throw new Error('Quote Payment ID not found');
  //         }
  //       } else {
  //         throw new Error('Data submission failed');
  //       }
  //     })
  //   ).subscribe(
  //     () => {},
  //     error => {
  //       this.toastr.error(error.message || 'An error occurred', 'Error');
  //       console.error(error);
  //     }
  //   );
  // }


  submitData() {

    if (!this.salesforceResponse || !this.salesforceResponse.data || !this.salesforceResponse.data.leadWithDetails) {
      console.error("salesforceResponse.data.leadWithDetails is not ready or missing");
      return;
    }
    
    const LeadId = this.salesforceResponse?.data?.leadWithDetails?.LeadId;
    if (!LeadId) {
      console.error("LeadId is not found in salesforceResponse.data.leadWithDetails");
    }


    const finalData = {
      ...this.personalInfo, // Merge personal information (Step 1 data)
      ...this.companyInfo,// Merge bank information (Step 2 data)
      LeadId
    };
  
    // Send data to the backend using userService
    this.userService.uploadUserData(finalData).pipe(
      switchMap(response => {
        if (response.message) {
          localStorage.removeItem('step1Data');
          localStorage.removeItem('mailform');
          localStorage.removeItem('step2Data');
          localStorage.removeItem('mailform2');
          localStorage.removeItem('finalData');
          // localStorage.clear();
          const quotePaymentId = this.salesforceResponse?.data?.quotePaymentWithDetails?.QuotePaymentId;
          const checkStatusData = {
            CustomerId:LeadId, // Ensure customerId exists in personalInfo
            CompanyName: "Virtuzone" // Ensure companyName exists in personalInfo
          };
  
          return this.userService.checkStatus(checkStatusData).pipe(
            switchMap(checkStatusResponse => {
              console.log("Check Status Response:", checkStatusResponse);
  
              if (checkStatusResponse.data.CustomerStatus === 'Auto Approved') {
                // Redirect to payment URL
                this.router.navigate([`/onlinepayment/${quotePaymentId}`]);
                return of(null);
              } else {
                window.alert("Your request has been submitted successfully. You will receive an email when your application is approved.");
                this.router.navigate(['/']);
                return of(null);
              }
            })
          );
        } else {
          throw new Error('Data submission failed');
        }
      })
    ).subscribe(
      () => {},
      error => {
        this.toastr.error(error.message || 'An error occurred', 'Error');
        console.error(error);
      }
    );
  }
  showError(errorMessage: string): void {
    this.toastr.error(errorMessage || 'Error submitting data', 'Error', {
      positionClass: this.getToastPosition()
    });
  }

  getToastPosition(): string {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    return scrollPosition > 100 ? 'toast-bottom-right' : 'toast-bottom-left'; // Adjust based on scroll
  }

    getTotalAmountIncludingVAT(): number {
    if (!this.matchScoreResponse?.products) return 0;
  
    return this.matchScoreResponse.products.reduce((total: number, product: {totalPriceVat: number}) => {
    
      return total + product.totalPriceVat;
    }, 0);
  }


  getTotalAmount(): number {
    if (!this.matchScoreResponse?.products) return 0;
  
    return this.matchScoreResponse.products.reduce((total: number, product: { unitPrice: number; quantity: number}) => {
      const itemTotal = product.unitPrice * product.quantity ;
      return total + itemTotal;
    }, 0);
  }

  getTotalDiscountedAmount(): number {
    if (!this.matchScoreResponse?.products) return 0;
  
    return this.matchScoreResponse.products.reduce((total: number, product: { totalPrice: number}) => {
      const itemTotal = product.totalPrice ;
      return total + itemTotal;
    }, 0);
  }

}
