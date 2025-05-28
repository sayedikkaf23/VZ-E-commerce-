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
import { map, of, switchMap, tap } from 'rxjs';
 import { OnlinePaymentService } from '../service/online-payment.service';
 
declare var $: any;
 
@Component({
  selector: 'app-virtual-reception-summary',
  templateUrl: './virtual-reception-summary.component.html',
  styleUrl: './virtual-reception-summary.component.css',
})
export class VirtualReceptionSummaryComponent implements AfterViewInit {
  isLoading = false;
  isBrowser: boolean;
  personalInfo: any = {};
  bankInfo: any = {};
  salesforceResponse: any;
  quoteWithProductDetails: any;
  showAll = false;
  displayShareholders: any = [];
  companyInfo: any = {};
  tradeLicense: any = {};
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
      const storedProductData = localStorage.getItem('VirtualServiceProducts');
      if (storedProductData) {
        const productData = JSON.parse(storedProductData);
        // If the data is an object, wrap it in an array
        this.serviceProducts = Array.isArray(productData)
          ? productData
          : [productData];
        console.log(
          'Retrieved Products from localStorage: ',
          this.serviceProducts
        );
      } else {
        console.log('No products found in localStorage.');
      }
    }
    // this.preventBackNavigation(); // Prevent back navigation on this page
   
    // this.quoteWithProductDetails = this.matchScoreResponse?.data;
 
    // if (!this.salesforceResponse) {
    //   Swal.fire({
    //     title: 'Session Expired',
    //     text: 'Your session has expired. Please complete the form again from the beginning.',
    //     icon: 'warning',
    //     confirmButtonText: 'OK',
    //     confirmButtonColor: '#FF5A5F'
    //   }).then((result) => {
    //     if (result.value) {
    //       localStorage.clear();
    //       this.router.navigate(['/home']);
    //     }
    //   });
    // } else if (this.isBrowser) {
 
   
 
      const mailform = localStorage.getItem('virtualdata');
      const mailform2 = localStorage.getItem('virtualdata1');
      const mailform3 = localStorage.getItem('virtualdata2');
 
   
        this.personalInfo = mailform ? JSON.parse(mailform) : {};
        this.companyInfo = JSON.parse(mailform2 || '{}');
        this.tradeLicense = JSON.parse(mailform3 || '{}');
       
 
        const shareholdersFromMailform2 = this.companyInfo.shareholders || [];
        const additionalShareholderInfo = mailform3
          ? JSON.parse(mailform3)
          : { companyTradeLicense: '', shareholders: [] };
 
        const mergedShareholders =
          additionalShareholderInfo.shareholders.length > 0
            ? additionalShareholderInfo.shareholders
            : shareholdersFromMailform2;
 
        if (
          !this.salesforceResponse ||
          !this.salesforceResponse.data ||
          !this.salesforceResponse.data.leadWithDetails
        ) {
          console.error(
            'salesforceResponse.data.leadWithDetails is not ready or missing'
          );
          return;
        }
 
 
     
 
        const mergedData = {
          ...this.personalInfo,
          ...this.companyInfo,
          companyTradeLicense: additionalShareholderInfo.companyTradeLicense,
          shareholders: mergedShareholders,
          ...this.tradeLicense
        };
 
        localStorage.setItem('mergedData', JSON.stringify(mergedData));
        this.displayShareholders = Array.isArray(mergedData.shareholders)
          ? mergedData.shareholders
          : Object.values(mergedData.shareholders || []);
 
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
 
  submitData() {
    this.isLoading = true;
    const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');
   
    console.log(mergedData, "mergedData");
 
    // Ensure LeadId is present
 
    // Check if mergedData contains shareholders
    const shareholdersData = mergedData?.shareholders || [];
 
    // Create payment opportunity payload
    const paymentPayload = {
      firstName: this.personalInfo.firstName,
      lastName: this.personalInfo.lastName,
      email: this.personalInfo.email,
      nationality: this.personalInfo.nationality,
      phone: this.personalInfo.mobileNumber.number,
      dob: this.personalInfo.birthday,
      type: "Virtual Receptionist",
      CustomerType: "C",
      uploadedFileNames: this.tradeLicense.uploadedFileNames,
      prodcutNameList: this.serviceProducts.map(product => ({
        ProductName: product.Product_Name,
        ProductFamily: "Virtual Receptionist",
        ProductDescription: "Service for UAE Resident",
        ProductCurrencyName: product.Currency_Code,
        ProductUnitprice: product.price,
        ProductQuantity: 1,  // Assuming quantity is 1
        ProductDiscount: 0 // Assuming no discount
      })),
      shareholders: shareholdersData.map((shareholder: {
        name: any;
        shareholderPercentage: any;
        dob: any;
        nationalityshareholder: any;
        countryRisk: any;
        files: any[];
      }) => ({
        name: shareholder.name,
        shareholderPercentage: shareholder.shareholderPercentage,
        dob: shareholder.dob,
        nationalityshareholder: shareholder.nationalityshareholder,
        countryRisk: shareholder.countryRisk,
        files: shareholder.files || []  // Default to empty array if files are undefined
      }))
    };
 
    // Call createPaymentOpportunity API
    this.userService.createPaymentOpportunity(paymentPayload).pipe(
      switchMap((paymentOpportunityResponse) => {
        // After creating payment opportunity, call digicomplice API
        const payload = {
          CustomerId: paymentOpportunityResponse.QuotePaymentId,
          CompanyName: 'Virtuzone'
        };
 
        return this.userService.digicomplice(payload).pipe(
          map(secondResponse => ({
            quotePaymentId: paymentOpportunityResponse.QuotePaymentId,
            leadId: secondResponse?.screeningmatchScore?.customerId || null
          }))
        );
      })
    ).pipe(
      switchMap(({ quotePaymentId, leadId }) => {
        if (!leadId) {
          throw new Error('Missing LeadId from screening response');
        }
 
        const checkStatusData = {
          CustomerId: leadId,
          CompanyName: 'Virtuzone'
        };
 
        return this.userService.checkStatus(checkStatusData).pipe(
          tap((checkStatusResponse: { data: { CustomerStatus: string } }) => {
            if (checkStatusResponse.data.CustomerStatus === 'Auto Approved') {
            this.callActivePaymentMethod(quotePaymentId);
            } else {
              window.alert(
                'Your request has been submitted successfully. You will receive an email when your application is approved.'
              );
              localStorage.removeItem('virtualdata');
              localStorage.removeItem('virtualdata1');
              localStorage.removeItem('virtualdata2');
              localStorage.removeItem('finalDataVirtual');
              this.router.navigate([`/failure/${quotePaymentId}`]);
            }
          })
        );
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
       
        // Show SweetAlert with retry option
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'An error occurred',
          showCancelButton: true,
          confirmButtonText: 'Retry',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            this.submitData(); // Retry the API call
          }
        });
 
        this.toastr.error(err.message || 'An error occurred', 'Error');
        console.error(err);
      }
    });
  }
 
 
 
 
  getTotalAmountIncludingVAT(): number {
    if (!this.matchScoreResponse?.products) return 0;
 
    return this.matchScoreResponse.products.reduce(
      (total: number, product: { totalPriceVat: number }) => {
        return total + product.totalPriceVat;
      },
      0
    );
  }
 
  getTotalDiscountedAmount(): number {
    if (!this.matchScoreResponse?.products) return 0;
 
    return this.matchScoreResponse.products.reduce(
      (total: number, product: { totalPrice: number }) => {
        const itemTotal = product.totalPrice;
        return total + itemTotal;
      },
      0
    );
  }
 
  getTotalAmount(): number {
    if (!this.matchScoreResponse?.products) return 0;
 
    return this.matchScoreResponse.products.reduce(
      (total: number, product: { unitPrice: number; quantity: number }) => {
        const itemTotal = product.unitPrice * product.quantity;
        return total + itemTotal;
      },
      0
    );
  }
 
  showError(errorMessage: string): void {
    this.toastr.error(errorMessage || 'Error submitting data', 'Error', {
      positionClass: this.getToastPosition(),
    });
  }
 
  getToastPosition(): string {
    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    return scrollPosition > 100 ? 'toast-bottom-right' : 'toast-bottom-left';
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
 