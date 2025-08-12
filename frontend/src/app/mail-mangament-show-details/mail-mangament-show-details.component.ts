import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // For toast notifications
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import AOS from 'aos';
import { switchMap, catchError, of, map, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { DataStorageService } from '../service/data-storage.service'; // Import the service
import { MatchScoreStorageService } from '../service/matchscore-storage.service';
import { GetnationalityService } from '../service/getnationality.service';
import { ChangeDetectorRef } from '@angular/core';
interface Nationality {
  common: string;
  country: string;
}
 
declare var $: any;
@Component({
  selector: 'app-mail-mangament-show-details',
  templateUrl: './mail-mangament-show-details.component.html',
  styleUrl: './mail-mangament-show-details.component.css'
})
export class MailMangamentShowDetailsComponent {
  isLoading = false;
  showAll = false;
  nationalities: Nationality[] = [];
  displayShareholders :any= [];
  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
  companyInfo: any = {}; // To store bank service information (Step 2 data)
  shareholders :any= [];
  serviceProducts: any[] | undefined;
  tradeLicenseFile: any = {};
 
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
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
 
    // Ensure this code runs only in the browser environment
    if(this.isBrowser) {
             if (this.isBrowser) {
  const leadDataRaw = sessionStorage.getItem('leadResponse');
  const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;
  const leadId = leadData?.LeadId;

  if (leadId) {
    this.isLoading = true;
    this.userService.getStep1(leadId).subscribe({
      next: (storedData) => {
        this.isLoading = false;
        this.personalInfo = storedData; 
         // 3) getTradeLicenseandShareholder → tradeLicenseFile etc.
          this.userService.getTradeLicenseAndShareholders(leadId).subscribe({
            next: (tradeData: any) => {
              this.tradeLicenseFile = tradeData || {};
console.log("Trade License Data:", tradeData);
              this.shareholders = tradeData.shareholders || []; 
              console.log("Shareholders Data:", this.shareholders);
             

            
            },
            error: (err:any) => {
              console.error('Failed to load trade license data:', err);
              this.toastr.error('Could not load trade license data.', 'Error');
            }
          });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load step1 & step2 data', err);
      }
    });
  }
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
 
 
//   submitData() {
//     // Combine personalInfo and companyInfo into finalData
//     const finalData = {
//       ...this.personalInfo, // Merge personal information (Step 1 data)
//       ...this.companyInfo   // Merge company information (Step 2 data)
//     };
//   console.log(finalData,"finalData")
//     // Show a SweetAlert confirmation dialog
//     Swal.fire({
//       title: 'Confirm Your Data',
//       text: "Once you move forward, you won't be able to edit your information. Please review and confirm your details.",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#FA2E52',
//       confirmButtonText: 'Yes, I confirm',
//       cancelButtonText: 'Review Data'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         const birthday = new Date(finalData.birthday);
//         const formattedBirthday = `${(birthday.getMonth() + 1).toString().padStart(2, '0')}/${birthday.getDate().toString().padStart(2, '0')}/${birthday.getFullYear()}`;
       
//         // const payload = {
//         //   firstName: finalData.firstName,
//         //   lastName: finalData.lastName,
//         //   email: finalData.email,
//         //   nationality: finalData.nationality,
//         //   phone: finalData.mobileNumber, // Ensure to map this correctly
//         //   dob: formattedBirthday,
//         //   service: "Bank_opening",
//         //   CustomerType: finalData.CustomerType,
//         //   shareholders: this.shareholders,
//         //   planname: "Bank Account Opening",
//         //   isProfile: false,
//         // };
 
 
//         const nationality = finalData.nationality;
 
// // Attempt to find a match for the user’s main nationality
// const mainMatch = this.nationalities.find(
//   (item) => item.common.toLowerCase() === nationality.toLowerCase()
// );
 
// // Fallback to the raw nationality if no match is found
// // 1. Main nationality straight from the form
// const mainNationality = finalData.nationality;   // e.g. "Indian"
 
// // 2. Grab every shareholder’s nationality (skip blanks)
// const shareholderNationalities = (finalData.shareholders ?? [])
//   .map((sh: { nationalityshareholder: any; }) => sh.nationalityshareholder)
//   .filter(Boolean);                              // keeps only truthy strings
 
// // 3. Merge (no deduping)
// const nationalities = [mainNationality, ...shareholderNationalities];
// const appliedRiskData = JSON.parse(localStorage.getItem('appliedRisk') || '{}');
 


// let subTypeId = null;

//     if (finalData.Bank === 'Traditional Corporate Bank Account Opening') {
//       subTypeId = 13;
//     } else if (finalData.Bank === 'Digital Corporate Bank Account Opening') {
//       subTypeId = 14;
//     } else if (finalData.Bank === 'Any of the above') {
//       subTypeId = 13;
//     } else {
//       throw new Error('Invalid Bank Type Selected ❌');
//     }

// // 4. Final payload
// let riskCode;
// switch (appliedRiskData.appliedRisk) {
//   case 'Low':
//     riskCode = 1;
//     break;
//   case 'Medium':
//     riskCode = 2;
//     break;
//   case 'High':
//     riskCode = 3;
//     break;
//   default:
//     riskCode = 0; // Default to 0 if no match
//     break;
// }
 
 
//   const payload = {
//     ServiceNameCode: 1,
//     SubTypeCode:subTypeId,
//     RiskCode:riskCode,
 
//   };
//         this.isLoading = true; // Show loading indicator if necessary
 
//         // First API call to callSalesforceEndpoint
//          this.userService.getServiceProducts(payload).pipe(
//                   catchError((error) => {
//                     console.error(error);
//                     this.isLoading = false;
//                     Swal.fire({
//                       title: 'Error',
//                       text: 'Something went wrong. Would you like to retry?',
//                       icon: 'error',
//                       showCancelButton: true,
//                       confirmButtonText: 'Retry',
//                       cancelButtonText: 'Cancel'
//                     }).then((retryResult) => {
//                       if (retryResult.isConfirmed) {
//                         this.submitData();
//                       }
//                     });
//                     return of(null); // gracefully complete the observable chain
//                   })
      
//         ).subscribe(
//           (quoteResponse: any) => {
//             this.isLoading = false; // Hide loader
 
//             // Save finalData in localStorage if needed
//             localStorage.setItem('BussinessServiceProducts', JSON.stringify(quoteResponse));
//             localStorage.setItem('finalDatabussiness', JSON.stringify(finalData));
//             this.matchScoreStorageService.setMatchScoreResponse(quoteResponse);
 
//             // Navigate to the next step
//             this.router.navigate(['/bussiness-show-details']); // Replace with your actual route
//           }
       
//         );
//       }
//       // If the user clicks "Review Data", do nothing so they can make corrections.
//     });
//   }
 
 submitData() {


  Swal.fire({
    title: 'Confirm Your Data',
    text: "Once you move forward, you won't be able to edit your information. Please review and confirm your details.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#FA2E52',
    confirmButtonText: 'Yes, I confirm',
    cancelButtonText: 'Review Data'
  }).then((result) => {
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
   
    const appliedRiskData = JSON.parse(sessionStorage.getItem('appliedRisk') || '{}');
    let subTypeId = this.personalInfo.bankType === 'Traditional Corporate Bank Account Opening' ? 13 : 
                    this.personalInfo.bankType === 'Digital Corporate Bank Account Opening' ? 14 : 
                    this.personalInfo.bankType === 'Any of the above' ? 13 : null;

    if (!subTypeId) throw new Error('Invalid Bank Type Selected ❌');

    const riskCode = appliedRiskData.appliedRisk === 'Low' ? 1 :
                     appliedRiskData.appliedRisk === 'Medium' ? 2 :
                     appliedRiskData.appliedRisk === 'High' ? 3 : 0;

    const servicePayload = {
      ServiceNameCode: 1,
      SubTypeCode: subTypeId,
      RiskCode: riskCode
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
        sessionStorage.setItem('serviceProducts', JSON.stringify(resp));
        sessionStorage.setItem('BussinessServiceProducts', JSON.stringify(resp));

        this.matchScoreStorageService.setMatchScoreResponse(resp);
 const leadResponseRaw = sessionStorage.getItem('leadResponse');
  const leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};

        const paymentPayload = {
                   LeadId: leadResponse.LeadId || '',
    AccountId: leadResponse.AccountId || '',
    ContactId: leadResponse.ContactId || '',
          firstName: this.personalInfo.FirstName,
          lastName: this.personalInfo.LastName,
          email: this.personalInfo.Email,
          nationality: this.personalInfo.Nationality,
          phone: this.personalInfo.Phone,
          countryCode: this.personalInfo.countryCode,
          dob: this.personalInfo.dob,
           serviceName: 'Business Bank Account Opening',
           subServiceName: 'Bank Account Opening',
          type: "Bank Account Opening",
          CustomerType: "C",
          subcategory: "business",
          activityType: this.personalInfo.activeType,
          totalShareholders: this.personalInfo.totalShareholders,
          companyTurnover: this.personalInfo.companyTurnover,
          companyLocationUAE: this.personalInfo.companyLocationUAE,
          companyLicensed: this.personalInfo.companyLicensed,
          bankType: this.personalInfo.bankType,
          prodcutNameList: serviceProducts.map(product => ({
            ProductName: product.Product_Name,
            ProductFamily: "Traditional Services",
            ProductDescription: "Service for UAE Resident",
            ProductCurrencyName: product.Currency_Code,
            ProductUnitprice: product.price,
            ProductQuantity: 1,
            vat: product.VAT,
            ProductDiscount: 0,
            ProductId: product.Product_Id,

          })),
          shareholders: this.shareholders.map((s: { name: any; shareholderPercentage: any; dob: any; nationalityshareholder: any; countryRisk: any; }) => ({
            name: s.name,
            shareholderPercentage: s.shareholderPercentage,
            dob: s.dob,
            nationalityshareholder: s.nationalityshareholder,
            countryRisk: s.countryRisk
          }))
        };

        this.serviceProducts = serviceProducts;
        return this.userService.createPaymentOpportunity(paymentPayload);
      }),
      switchMap(response => {
        if (!response?.salesforceResponse.QuotePaymentId) throw new Error('Missing QuotePaymentId');
        const quotePaymentId = response.salesforceResponse.QuotePaymentId;
        const digiPayload = { CustomerId: quotePaymentId, CompanyName: 'Virtuzone' };
        return this.userService.digicomplice(digiPayload).pipe(
          map(digiRes => ({
            quotePaymentId,
            leadId: digiRes?.screeningmatchScore?.customerId || null
          }))
        );
      }),
      switchMap(({ quotePaymentId, leadId }) => {
        if (!leadId) throw new Error('Missing LeadId');
        const checkStatusData = { CustomerId: leadId, CompanyName: 'Virtuzone' };
        return this.userService.checkStatus(checkStatusData).pipe(
          tap(res => {
            if (res?.data?.CustomerStatus === 'Auto Approved') {
              sessionStorage.setItem("quotePaymentId", quotePaymentId);
              this.router.navigate(['/bussiness-show-details']);
            } else {
              alert('Your request has been submitted successfully. You will receive an email when your application is approved.');
              this.router.navigate([`/failure/${quotePaymentId}`]);
            }
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
          text: err?.error?.[0]?.message || 'An error occurred',
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

 
  toggleView() {
    this.showAll = !this.showAll;
    this.displayShareholders = this.showAll ? this.shareholders : this.shareholders.slice(0, 5);
  }
}
 