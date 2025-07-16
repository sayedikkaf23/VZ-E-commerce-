import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // For toast notifications
import { Router } from '@angular/router';
import AOS from 'aos';
import { catchError, map, switchMap, tap } from 'rxjs';
import { DataStorageService } from '../service/data-storage.service'; // Import the service
import { MatchScoreStorageService } from '../service/matchscore-storage.service';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { GetnationalityService } from '../service/getnationality.service';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../service/user.service';

interface Nationality {
  common: string;
  country: string;
}

interface Shareholder {
  name: string;
  shareholderPercentage: number;
  dob: string;
  nationalityshareholder: string;
  countryRisk: string;
}


declare var $: any;

@Component({
  selector: 'app-show-details',
  templateUrl: './show-details.component.html',
  styleUrls: ['./show-details.component.css'] // Correct styleUrls syntax
})
export class ShowDetailsComponent implements AfterViewInit {
  isLoading = false;
  nationalities: Nationality[] = [];
  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
  bankInfo: any = {}; // To store bank service information (Step 2 data)
  salesforceResponse: any;
  quoteWithProductDetails: any;
  serviceProducts: any;
shareholders: Shareholder[] = [];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService, // For showing notifications
    private router: Router,
    private userService: UserService,
    private dataStorageService: DataStorageService,
    private matchScoreStorageService: MatchScoreStorageService,
    private cdRef: ChangeDetectorRef,

    private getnationalityService: GetnationalityService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Check if the platform is a browser
  }

  ngOnInit(): void {

    this.getnationalityService.getNationality().subscribe((data) => {
      this.nationalities = data.map((country: any) => ({
        common: country.name.common,
        country: country.name.country
      }));
     
    
    this.cdRef.detectChanges(); // Trigger change detection to update the view
  });

    this.salesforceResponse = this.dataStorageService.getSalesforceResponse();

    this.quoteWithProductDetails = this.salesforceResponse?.data?.quoteWithProductDetails;
    // console.log( this.salesforceResponse,"salefoce",this.quoteWithProductDetails)
    // Ensure this code runs only in the browser environment
   
    if (this.isBrowser) {
      const leadDataRaw = sessionStorage.getItem('leadResponse');
      const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;
      const leadId = leadData?.LeadId;

      if (leadId) {
        this.isLoading = true;
        this.userService.getStep1(leadId).subscribe({
          next: (formData) => {
            this.personalInfo = formData;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Failed to load step1 data', err);
            this.isLoading = false;
          }
        });
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
    // console.log(scrollPosition); // You can log this to see how far the user has scrolled
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
  //     ...this.bankInfo // Merge bank information (Step 2 data)
  //   };
  
  //   // Send data to the backend using userService
  //   this.userService.uploadUserData(finalData).pipe(
  //     switchMap(response => {
  //       if (response.message) {
  //         // Clear localStorage after successful submission
  //         localStorage.removeItem('step1Data');
  //         localStorage.removeItem('step2Data');

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


  // submitData() {
  //   Swal.fire({
  //     title: 'Confirm Your Data',
  //     text: "Once you move forward, you won't be able to edit your information.",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, I confirm',
  //     cancelButtonText: 'Review Data'
  //   }).then(result => {
  //     if (!result.isConfirmed) return;


  //   const finalData = {
  //     ...this.personalInfo, // Merge personal information (Step 1 data)
  //     ...this.bankInfo // Merge bank information (Step 2 data)
  //   };
  //   let subTypeId = null;

  //   if (finalData.Bank === 'Traditional Personal bank Account Opening') {
  //     subTypeId = 11;
  //   } else if (finalData.Bank === 'Digital Personal Bank Account Opening') {
  //     subTypeId = 12;
  //   } else if (finalData.Bank === 'Any of the above Bank Account Opening') {
  //     subTypeId = 11;
  //   } else {
  //     throw new Error('Invalid Bank Type Selected ❌');
  //   }

  //     const payload = {
  //       ServiceNameCode: 1,
  //       SubTypeCode:subTypeId,
  //       RiskCode:finalData.nationality
  //     };
      
  //     this.isLoading = true;
  //     this.userService.getServiceProducts(payload)
  //       .pipe(
  //         catchError(err => {
  //           console.error(err);
  //           this.isLoading = false;
  //           this.toastr.error('Couldn’t load service products.', 'Error');
  //           return of(null);
  //         })
  //       )
  //       .subscribe(resp => {
  //         this.isLoading = false;
  //         if (!resp) return;
  //         // localStorage.removeItem('step1Data');
  //         // localStorage.removeItem('step2Data');
  //         // Store or pass along resp as needed…
  //         localStorage.setItem('serviceProducts', JSON.stringify(resp));
  //         // then navigate:
  //         this.router.navigate(['/ShowDetails-2']);
  //       });
  //   });
  // }
  
submitData() {
  Swal.fire({
    title: 'Confirm Your Data',
    text: "Once you move forward, you won't be able to edit your information.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, I confirm',
    cancelButtonText: 'Review Data'
  }).then(result => {
    if (!result.isConfirmed) return;

    const quotePaymentId = sessionStorage.getItem('quotePaymentId');
    const payload = {
        firstName: this.personalInfo.FirstName,
          lastName: this.personalInfo.LastName,
          email: this.personalInfo.Email,
          nationality: this.personalInfo.Nationality,
          phone: this.personalInfo.Phone,
          countryCode: this.personalInfo.countryCode,
          dob: this.personalInfo.dob,
          leadId: '',
          service_id: 1
      }

    const finalData = { ...this.personalInfo, ...this.bankInfo };
    let subTypeId: number | null = null;

    if (this.personalInfo.bankType === 'Traditional Personal bank Account Opening') subTypeId = 11;
    else if (this.personalInfo.bankType === 'Digital Personal Bank Account Opening') subTypeId = 12;
    else if (this.personalInfo.bankType === 'Any of the above Bank Account Opening') subTypeId = 11;
    else throw new Error('Invalid Bank Type Selected ❌');

    const servicePayload = {
      ServiceNameCode: 1,
      SubTypeCode: subTypeId,
      RiskCode: this.personalInfo.Nationality
    };

    this.isLoading = true;
    
    of(quotePaymentId).pipe(
      switchMap(id => {
        if (id) {
          return this.userService.createLeadOnly(payload).pipe(
            tap(res => {
              if (this.isBrowser && res?.data) {
                sessionStorage.setItem('leadResponse', JSON.stringify(res.data));
              }
            })
          );
        } else {
          return of(null);
        }
      }),
      switchMap(() =>this.userService.getServiceProducts(servicePayload)),
      catchError(err => {
        console.error(err);
        this.isLoading = false;
        this.toastr.error('Couldn’t load service products.', 'Error');
        return of(null);
      }),
      switchMap(resp => {
        if (!resp) return of(null);

        const serviceProducts = Array.isArray(resp) ? resp : [resp];
        // localStorage.setItem('serviceProducts', JSON.stringify(serviceProducts));
 sessionStorage.setItem('serviceProducts', JSON.stringify(resp));
 const leadResponseRaw = sessionStorage.getItem('leadResponse');
  const leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};

  //         // then navigate:
  //         this.router.navigate(['/ShowDetails-2']);
        const paymentPayload = {
          countryCode:this.personalInfo.countryCode,
          LeadId: leadResponse.LeadId || '',
    AccountId: leadResponse.AccountId || '',
    ContactId: leadResponse.ContactId || '',
          firstName: this.personalInfo.FirstName,
          lastName: this.personalInfo.LastName,
          email: this.personalInfo.Email,
          nationality: this.personalInfo.Nationality,
          phone: this.personalInfo.Phone,
          // countryCode: this.personalInfo.mobileNumber.dialCode,
          dob: this.personalInfo.dob,
           serviceName: 'Bank Account Opening',
           subServiceName: 'Personal Bank Account Opening',
          CustomerType: "I",
          subcategory: "personal",
          companyLocationUAE: this.personalInfo.companyLocationUAE,
          bankType: this.personalInfo.bankType,
          employmentType: this.personalInfo.employmentType,
          salary: this.personalInfo.salary,
          prodcutNameList: serviceProducts.map(product => ({
            ProductName: product.Product_Name,
            ProductFamily: "Traditional Services",
            ProductDescription: "Service for UAE Resident",
            ProductCurrencyName: product.Currency_Code,
            ProductUnitprice: product.price,
            ProductQuantity: 1,
            ProductDiscount: 0,
              vat: product.vat,
                ProductId: product.Product_Id,  

          })),
          shareholders: this.shareholders.map((shareholder: { name: any; shareholderPercentage: any; dob: any; nationalityshareholder: any; countryRisk: any; }) => ({
            name: shareholder.name,
            shareholderPercentage: shareholder.shareholderPercentage,
            dob: shareholder.dob,
            nationalityshareholder: shareholder.nationalityshareholder,
            countryRisk: shareholder.countryRisk
          }))
        };

        this.serviceProducts = serviceProducts;
        return this.userService.createPaymentOpportunity(paymentPayload);
      }),
      switchMap(response => {
        if (!response?.salesforceResponse.QuotePaymentId) throw new Error(response.error ||'Missing QuotePaymentId from Salesforce');

        const quotePaymentId = response.salesforceResponse.QuotePaymentId;
        const digiPayload = {
          CustomerId: quotePaymentId,
          CompanyName: 'Virtuzone'
        };

        return this.userService.digicomplice(digiPayload).pipe(
          map(digiRes => ({
            quotePaymentId,
            leadId: digiRes?.screeningmatchScore?.customerId || null
          }))
        );
      }),
      switchMap(({ quotePaymentId, leadId }) => {
        if (!leadId) throw new Error('Missing LeadId from screening response');

        const checkStatusData = {
          CustomerId: leadId,
          CompanyName: 'Virtuzone'
        };

        return this.userService.checkStatus(checkStatusData).pipe(
          tap((checkStatusResponse: { data: { CustomerStatus: string } }) => {
            if (checkStatusResponse.data.CustomerStatus === 'Auto Approved') {
              sessionStorage.setItem(  "quotePaymentId",quotePaymentId)
               this.router.navigate(['/ShowDetails-2']);
            } else {
              window.alert('Your request has been submitted successfully. You will receive an email when your application is approved.');
              this.router.navigate([`/failure/${quotePaymentId}`]);
            }

            // localStorage.removeItem('step1Data');
            // localStorage.removeItem('step2Data');
            // localStorage.removeItem('finalDatabussiness');
            // localStorage.removeItem('mailform');
            // localStorage.removeItem('mailform2');
            // localStorage.removeItem('finalData');
          })
        );
      })
    ).subscribe({
      next: () => this.isLoading = false,
      error: err => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.[0]?.message || err?.error?.error || 'An error occurred',
          showCancelButton: true,
          confirmButtonText: 'Retry',
          cancelButtonText: 'Cancel',
        }).then(result => {
          if (result.isConfirmed) {
            this.submitData(); // Retry
          }
        });

        this.toastr.error(err.message || 'An error occurred', 'Error');
        console.error(err);
      }
    });
  });
}

}
