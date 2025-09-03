import { isPlatformBrowser, LocationStrategy } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { DataStorageService } from '../service/data-storage.service';
import AOS from 'aos';
import Swal from 'sweetalert2';
import { MatchScoreStorageService } from '../service/matchscore-storage.service';
import { map, switchMap, tap } from 'rxjs';
 import { OnlinePaymentService } from '../service/online-payment.service';
 
declare var $: any;
 
@Component({
  selector: 'app-mails-management-summary',
  templateUrl: './mails-management-summary.component.html',
  styleUrl: './mails-management-summary.component.css'
})
export class MailsManagementSummaryComponent {
  isLoading = false;
  isBrowser: boolean;
  personalInfo: any = {};
  bankInfo: any = {};
  tradeLicenseFile: any = {};
  salesforceResponse: any;
  quoteWithProductDetails: any;
  showAll = false;
  displayShareholders: any = [];
  companyInfo: any = {};
  shareholders: any = [];
  matchScoreResponse: any;
  serviceProducts: any[] = []; // Array to store the product details
 
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private dataStorageService: DataStorageService,
    private userService: UserService,
    private matchScoreStorageService: MatchScoreStorageService,
    private onlinePaymentService: OnlinePaymentService,
 
    @Inject(PLATFORM_ID) private platformId: Object,
    private locationStrategy: LocationStrategy // Inject LocationStrategy for back navigation control
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
 
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
      const storedProductData = sessionStorage.getItem('MailServiceProducts');
      if (storedProductData) {
        const productData = JSON.parse(storedProductData);
        // If the data is an object, wrap it in an array
        this.serviceProducts = Array.isArray(productData) ? productData : [productData];
        console.log("Retrieved Products from sessionStorage: ", this.serviceProducts);
      } else {
        console.log("No products found in sessionStorage.");
      }
   
    }
    // this.preventBackNavigation(); // Prevent back navigation on this page
   
   
 

   
 
       
 
   
  }
 
  ngAfterViewInit(): void {
    if (this.isBrowser) {
      AOS.init();
      this.initializeJQueryFunctions();
    }
  }
 
  // preventBackNavigation() {
  //   history.pushState(null, '', window.location.href);
 
  //   // Listen for popstate event to handle the back button navigation consistently
  //   window.addEventListener('popstate', () => {
  //     history.pushState(null, '', window.location.href);
  //     this.toastr.error('Back navigation is disabled on this page.', 'Warning');
  //     // Reload the page to reset the state
  //     setTimeout(() => {
  //       window.location.reload();
  //     }, 50);
  //   });
  // }
 
  initializeJQueryFunctions() {
    $(document).ready(() => {
      $('.scrollToTop').click(function (event: any) {
        event.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        return false;
      });
 
      $('.navbar-toggle').click(() => {
        $('html').toggleClass('menu-show');
      });
 
      $('.header-menu-overlay').click(() => {
        $('html').removeClass('menu-show');
      });
 
      $('.sub-menu-toggle').click(() => {
        $(this).parent().toggleClass('submenu_active');
      });
    });
  }
 
  // submitData() {
  //   const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');
 
  //   // Extract LeadId safely
  //   const LeadId = this.salesforceResponse?.data?.leadWithDetails?.LeadId;
  //   if (!LeadId) {
  //     console.error("LeadId is missing from mergedData");
  //     this.toastr.error("Lead ID not found, submission failed.");
  //     return;
  //   }
 
  //   this.userService.mailform(mergedData).pipe(
  //     switchMap(response => {
  //       // Retrieve quotePaymentId from the response instead of salesforceResponse
  //       const quotePaymentId = this.salesforceResponse?.data?.quotePaymentWithDetails?.QuotePaymentId;
 
  //       if (!quotePaymentId) {
  //         throw new Error('Quote Payment ID is missing');
  //       }
 
  //       // Clear localStorage
  //       localStorage.removeItem('mailform');
  //       localStorage.removeItem('mailform1');
  //       localStorage.removeItem('mailform2');
 
  //       const checkStatusData = {
  //         CustomerId: LeadId,
  //         CompanyName: "Virtuzone"
  //       };
 
  //       return this.userService.checkStatus(checkStatusData).pipe(
  //         map((checkStatusResponse: any) => ({ checkStatusResponse, quotePaymentId }))
  //       );
  //     })
  //   ).subscribe(
  //     (result: any) => {
  //       console.log("Check Status Response:", result.checkStatusResponse);
 
  //       if (result.checkStatusResponse.data.CustomerStatus === 'Auto Approved') {
  //         this.router.navigate([`/onlinepayment/${result.quotePaymentId}`]);
  //       } else {
  //         window.alert("Your request has been submitted successfully. You will receive an email when your application is approved.");
  //         this.router.navigate(['/']);
  //       }
  //     },
  //     (error) => {
  //       console.error('Error submitting data:', error);
  //       this.toastr.error(error.message || 'An error occurred', 'Error');
  //     }
  //   );
  // }
 
 
//   submitData() {
//     this.isLoading = true;
//     const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');
   
//     console.log(mergedData, "mergedData");
//     const uploadedFileNames = mergedData?.uploadedFileNames || [];
   
//     // Ensure LeadId is present
 
//     // Check if mergedData contains shareholders
//     const shareholdersData = mergedData?.shareholders || [];
 
//     // Create payment opportunity payload
//     const paymentPayload = {
//       firstName: this.personalInfo.firstName,
//       lastName: this.personalInfo.lastName,
//       email: this.personalInfo.email,
//       nationality: this.personalInfo.nationality,
//       phone: this.personalInfo.mobileNumber.number,
//          countryCode:this.personalInfo.mobileNumber.dialCode,
//       dob: this.personalInfo.birthday,
//       type: "Mail Management",
//       CustomerType: "C",
//       uploadedFileNames: uploadedFileNames,
//       prodcutNameList: this.serviceProducts.map(product => ({
//         ProductName: product.Product_Name,
//         ProductFamily: "Mail Management",
//         ProductDescription: "Service for UAE Resident",
//         ProductCurrencyName: product.Currency_Code,
//         ProductUnitprice: product.price,
//         ProductQuantity: 1,  // Assuming quantity is 1
//         ProductDiscount: 0 // Assuming no discount
//       })),
//       shareholders: shareholdersData.map((shareholder: {
//         name: any;
//         shareholderPercentage: any;
//         dob: any;
//         nationalityshareholder: any;
//         countryRisk: any;
//         files: any[];
//       }) => ({
//         name: shareholder.name,
//         shareholderPercentage: shareholder.shareholderPercentage,
//         dob: shareholder.dob,
//         nationalityshareholder: shareholder.nationalityshareholder,
//         countryRisk: shareholder.countryRisk,
//         files: shareholder.files || []  // Default to empty array if files are undefined
//       }))
//     };
 
//     // Call createPaymentOpportunity API
//     this.userService.createPaymentOpportunity(paymentPayload).pipe(
//       switchMap((paymentOpportunityResponse) => {
//         // After creating payment opportunity, call digicomplice API
//         const payload = {
//           CustomerId: paymentOpportunityResponse.QuotePaymentId,
//           CompanyName: 'Virtuzone'
//         };
 
//         return this.userService.digicomplice(payload).pipe(
//           map(secondResponse => ({
//             quotePaymentId: paymentOpportunityResponse.QuotePaymentId,
//             leadId: secondResponse?.screeningmatchScore?.customerId || null
//           }))
//         );
//       })
//     ).pipe(
//           switchMap(({ quotePaymentId, leadId }) => {
//         if (!leadId) {
//           throw new Error('Missing LeadId from screening response');
//         }

//         const documentPayload = {
//           quotePaymentId: quotePaymentId,
//           serviceName: 'Mail Management',
//           shareholders: shareholdersData.map((s: {
//             name: string;
//             shareholderPercentage: number;
//             dob: string;
//             nationalityshareholder: string;
//             files?: {
//               name: string;
//               url: string;
//               type: string;
//               oopId: string;
//             }[];
//           }) => ({
//             name: s.name,
//             shareholderPercentage: s.shareholderPercentage,
//             dob: s.dob,
//             nationalityshareholder: s.nationalityshareholder,
//             files: s.files?.map((f: any) => ({
//               name: f.name,
//               url: f.url,
//               type: f.type,
//               oopId: f.oopId
//             })) ?? []
//           }))
//         };


//         return this.userService.insertShareholderDocuments(
//           documentPayload.quotePaymentId,
//           documentPayload.serviceName,
//           documentPayload.shareholders
//         ).pipe(
//           switchMap(() => {
//             const checkStatusData = {
//               CustomerId: leadId,
//               CompanyName: 'Virtuzone'
//             };

//       return this.userService.checkStatus(checkStatusData).pipe(
//         tap((checkStatusResponse: { data: { CustomerStatus: string } }) => {
//           if (checkStatusResponse.data.CustomerStatus === 'Auto Approved') {
//                this.callActivePaymentMethod(quotePaymentId);
//           } else {
//             window.alert(
//               'Your request has been submitted successfully. You will receive an email when your application is approved.'
//             );
//               localStorage.removeItem('mailform');
//               localStorage.removeItem('finalDataMail');
//               localStorage.removeItem('mailform1');
//               localStorage.removeItem('mailform2');
//             this.router.navigate([`/failure/${quotePaymentId}`]);
//           }

       
//         })
//       );
//     })
//   );
// })
//     ).subscribe({
//       next: () => {
//         this.isLoading = false;
//       },
//       error: (err) => {
//         this.isLoading = false;
 
//         // Show SweetAlert with retry option
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: err?.error?.[0]?.message || 'An error occurred',
//           showCancelButton: true,
//           confirmButtonText: 'Retry',
//           cancelButtonText: 'Cancel',
//         }).then((result) => {
//           if (result.isConfirmed) {
//             this.submitData(); // Retry the API call
//           }
//         });
 
//         this.toastr.error(err.message || 'An error occurred', 'Error');
//         console.error(err);
//       }
//     });
//   }
 
   submitData() {
  this.isLoading = true;

  const quotePaymentId = sessionStorage.getItem("quotePaymentId");

  if (quotePaymentId) {
    this.callActivePaymentMethod(quotePaymentId);
  } else {
    this.toastr.error('Missing Quote Payment ID.', 'Error');
  }
    // localStorage.removeItem('step1Data');
             localStorage.removeItem('mailform');
              localStorage.removeItem('finalDataMail');
              localStorage.removeItem('mailform1');
              localStorage.removeItem('mailform2');
            sessionStorage.removeItem('quotePaymentId');
            sessionStorage.removeItem('leadResponse');


  this.isLoading = false;
}

 
  showError(errorMessage: string): void {
    this.toastr.error(errorMessage || 'Error submitting data', 'Error', {
      positionClass: this.getToastPosition()
    });
  }
 
  getToastPosition(): string {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    return scrollPosition > 100 ? 'toast-bottom-right' : 'toast-bottom-left';
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
        case 'afs':
           this.router.navigate(['/checkout', quotePaymentId]); // use the ID to navigat
         break;



 
        default:
          Swal.fire('Error', 'Unsupported payment method', 'error');
      }
    },
    () => Swal.fire('Error', 'Unable to fetch payment methods', 'error')
  );
}
 
}
 