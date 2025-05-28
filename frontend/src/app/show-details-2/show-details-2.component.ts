import { isPlatformBrowser, Location } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { DataStorageService } from '../service/data-storage.service';
import AOS from 'aos';
import { switchMap, of, map, tap, MonoTypeOperatorFunction, retryWhen, delay, take } from 'rxjs';
import Swal from 'sweetalert2';
import { MatchScoreStorageService } from '../service/matchscore-storage.service';
 import { OnlinePaymentService } from '../service/online-payment.service';
 
declare var $: any;
 
@Component({
  selector: 'app-show-details-2',
  templateUrl: './show-details-2.component.html',
  styleUrls: ['./show-details-2.component.css']
})
export class ShowDetails2Component implements AfterViewInit {
  isLoading = false;
  isBrowser: boolean;
  personalInfo: any = {};
  bankInfo: any = {};
  salesforceResponse: any;
  matchScoreResponse: any;
  serviceProducts: any[] = [];
  selectedCountry: string = ''; // Initialize with an empty string or default country code if needed
 
  quoteWithProductDetails: any;
 
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
      private onlinePaymentService: OnlinePaymentService,
    private router: Router,
    private dataStorageService: DataStorageService,
    private matchScoreStorageService: MatchScoreStorageService,
    private userService: UserService,
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
    this.matchScoreResponse = this.matchScoreStorageService.getMatchScoreResponse();
    this.quoteWithProductDetails = this.matchScoreResponse?.products;
console.log( this.salesforceResponse, this.quoteWithProductDetails)
    // Check if the salesforceResponse is empty or null
   
   if(this.isBrowser) {
      const step1Data = localStorage.getItem('step1Data');
      const step2Data = localStorage.getItem('step2Data');
 
      if (!step1Data || !step2Data) {
        this.router.navigate(['/home']);  // Navigate to home if there's no data
      } else {
        this.personalInfo = JSON.parse(step1Data);
        this.bankInfo = JSON.parse(step2Data);
 
        // Prevent back navigation
        // this.preventBackNavigation();
      }
 
      const raw = localStorage.getItem('serviceProducts');
      if (raw) {
        const parsed = JSON.parse(raw);
        // ensure it’s always an array
        this.serviceProducts = Array.isArray(parsed) ? parsed : [parsed];
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
 
  // preventBackNavigation() {
  //   // Push the current route to history to prevent back navigation
  //   history.pushState(null, '', this.router.url);
 
  //   // Listen for 'popstate' events to block back navigation
  //   window.addEventListener('popstate', (event) => {
  //     history.pushState(null, '', this.router.url);
  //     // Display an optional warning message
  //     this.toastr.error('Back navigation is disabled on this page.', 'Warning');
  //      // Reload the page to reset the state
  //       setTimeout(() => {
  //         window.location.reload();
  //       }, 50);
  //   });
  // }
 
  submitData() {
    if (!this.salesforceResponse || !this.salesforceResponse.data || !this.salesforceResponse.data.leadWithDetails) {
      console.error("salesforceResponse.data.leadWithDetails is not ready or missing");
      return;
    }
 
    const LeadId = this.salesforceResponse?.data?.leadWithDetails?.LeadId;
    if (!LeadId) {
      console.error("LeadId is not found in salesforceResponse.data.leadWithDetails");
      return;
    }
 
    const finalData = {
      ...this.personalInfo,
      ...this.bankInfo,
      LeadId
    };
 
    // Call the backend API to create a payment opportunity
    this.userService.createPaymentOpportunity(finalData).subscribe(
      (response: any) => {
        console.log("Payment Opportunity Created: ", response);
        this.toastr.success('Payment Opportunity Created Successfully', 'Success');
        // After successful creation, navigate to the payment page
        const quotePaymentId = this.salesforceResponse?.data?.quotePaymentWithDetails?.QuotePaymentId;
        this.router.navigate([`/onlinepayment/${quotePaymentId}`]);
      },
      (error) => {
        console.error("Error creating payment opportunity:", error);
        this.toastr.error('An error occurred while creating payment opportunity', 'Error');
      }
    );
  }
 
 
 
  getTotalAmountIncludingVAT(): number {
    if (!this.matchScoreResponse?.products) return 0;
 
    return this.matchScoreResponse.products.reduce((total: number, product: {totalPriceVat: number}) => {
   
      return total + product.totalPriceVat;
    }, 0);
  }
 
  getTotalDiscountedAmount(): number {
    if (!this.matchScoreResponse?.products) return 0;
 
    return this.matchScoreResponse.products.reduce((total: number, product: { totalPrice: number}) => {
      const itemTotal = product.totalPrice ;
      return total + itemTotal;
    }, 0);
  }
 
  getTotalAmount(): number {
    if (!this.matchScoreResponse?.products) return 0;
 
    return this.matchScoreResponse.products.reduce((total: number, product: { unitPrice: number; quantity: number}) => {
      const itemTotal = product.unitPrice * product.quantity ;
      return total + itemTotal;
    }, 0);
  }
 
  submitPaymentOpportunity() {
    // Set loading to true at the start
    this.isLoading = true;
 
    // Check if serviceProducts is properly populated
    if (!this.serviceProducts || this.serviceProducts.length === 0) {
      this.toastr.error('No products available to submit.', 'Error');
      this.isLoading = false; // Hide loader when no products are available
      return;
    }
 
    // Prepare the payload for the API request
    const paymentPayload = {
      firstName: this.personalInfo.firstName,
      lastName: this.personalInfo.lastName,
      email: this.personalInfo.email,
      nationality: this.personalInfo.nationality,
      phone: this.personalInfo.mobileNumber.number,
      dob: this.personalInfo.birthday,
      type: "Bank Account Opening",
      subcategory: "personal",
      CustomerType: "I",
      prodcutNameList: this.serviceProducts.map(product => ({
        ProductName: product.Product_Name,
        ProductFamily: "Traditional Services", // Example placeholder
        ProductDescription: "Service for UAE Resident", // Example placeholder
        ProductCurrencyName: product.Currency_Code,
        ProductUnitprice: product.price,
        ProductQuantity: 1,  // Assuming quantity is 1
        ProductDiscount: 0 // Assuming no discount
      }))
    };
    console.log("Sending Payment Opportunity Payload:", paymentPayload);
 
    // Call the first API to create the payment opportunity
    this.userService.createPaymentOpportunity(paymentPayload).pipe(
      switchMap((response) => {
        console.log('Payment opportunity created:', response);
 
        // Extract the QuotePaymentId from the response
        const quotePaymentId = response.QuotePaymentId;
        console.log(quotePaymentId);
 
        // Prepare payload for the second API call
        const payload = {
          CustomerId: quotePaymentId,
          CompanyName: 'Virtuzone'
        };
 
        // Call the second API (digicomplice) after the first one is successful
        return this.userService.digicomplice(payload).pipe(
          map(secondResponse => ({
            quotePaymentId,
            leadId: secondResponse?.screeningmatchScore?.customerId || null
          }))
        );
      }),
      switchMap(({ quotePaymentId, leadId }) => {
        if (!leadId) {
          throw new Error('Missing LeadId from screening response');
        }
 
        // Prepare the data for the third API call
        const checkStatusData = {
          CustomerId: leadId,
          CompanyName: 'Virtuzone'
        };
 
        // Call the third API (checkStatus)
        return this.userService.checkStatus(checkStatusData).pipe(
          tap((checkStatusResponse: { data: { CustomerStatus: string } }) => {
            if (checkStatusResponse.data.CustomerStatus === 'Auto Approved') {
              // this.router.navigate([`/onlinepayment/${quotePaymentId}`]);
               this.callActivePaymentMethod(quotePaymentId);
            } else {
              window.alert(
                'Your request has been submitted successfully. You will receive an email when your application is approved.'
              );

                     localStorage.removeItem('step1Data');
        localStorage.removeItem('step2Data');
    
              this.router.navigate([`/failure/${quotePaymentId}`]);
            }
 
            // Clear local storage if needed
            // localStorage.clear();
          })
        );
      })
    ).pipe(
      retryWhen(errors =>
        errors.pipe(
          // Hide loader before showing SweetAlert dialog
          switchMap(() => {
            this.isLoading = false; // Hide loader when SweetAlert is shown
            return Swal.fire({
              title: 'API Error',
              text: 'Do you want to retry the request?',
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Retry',
              cancelButtonText: 'Cancel'
            }).then(result => {
              if (result.isConfirmed) {
                this.isLoading = true; // Show loader when retrying
                return of(null); // Proceed with retrying if the user confirms
              } else {
                this.isLoading = false; // Stop loader if the user cancels
                throw new Error('User canceled the retry'); // Stop retrying if canceled
              }
            });
          })
        )
      )
    ).subscribe({
      next: () => {
        // Stop loading once the request is successfully completed
        this.isLoading = false;
      },
      error: (err) => {
        // Handle errors, stop loading
        this.isLoading = false;
        if (err.message.includes("DUPLICATE_VALUE")) {
          this.toastr.error('This price definition already exists in the price book.', 'API Error');
        } else {
          this.toastr.error(err.message || 'An error occurred', 'Error');
        }
        console.error(err);
      }
    });
  }
 
  
 
 callActivePaymentMethod(quotePaymentId: string): void {
  this.onlinePaymentService.getPaymentModesHome().subscribe(
    (response: any) => {
      const activeMethod = response.paymentMethods.find((method: any) => method.isActive);
      if (!activeMethod) {
        Swal.fire('Error', 'No active payment method found', 'error');
        return;
      }

      switch (activeMethod.name.toLowerCase()) {
        case 'stripe':
          this.onlinePaymentService.payNowByStripe(quotePaymentId).subscribe(
            (res: any) => window.location.href = res.stripeData.url,
            () => Swal.fire('Error', 'Failed to redirect to Stripe', 'error')
          );
          break;

        case 'telr':
          this.onlinePaymentService.PayViaTelr(quotePaymentId).subscribe(
            (res: any) => window.location.href = res.telrData.order.url,
            () => Swal.fire('Error', 'Failed to redirect to Telr', 'error')
          );
          break;

        case 'total pay':
          this.onlinePaymentService.getPayNowDataById(quotePaymentId).subscribe(
            (res: any) => window.location.href = res.totalpayData.redirect_url,
            () => Swal.fire('Error', 'Failed to redirect to TotalPay', 'error')
          );
          break;

        default:
          Swal.fire('Error', 'Unsupported payment method', 'error');
      }
    },
    () => Swal.fire('Error', 'Unable to fetch payment methods', 'error')
  );
}

 
 
 
}
 