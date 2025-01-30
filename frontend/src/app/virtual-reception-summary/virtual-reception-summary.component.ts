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

declare var $: any;

@Component({
  selector: 'app-virtual-reception-summary',
  templateUrl: './virtual-reception-summary.component.html',
  styleUrl: './virtual-reception-summary.component.css'
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
  shareholders: any = [];
  matchScoreResponse: any;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private dataStorageService: DataStorageService,
    private userService: UserService,
    private matchScoreStorageService: MatchScoreStorageService,

    @Inject(PLATFORM_ID) private platformId: Object,
    private locationStrategy: LocationStrategy // Inject LocationStrategy for back navigation control
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
    this.preventBackNavigation(); // Prevent back navigation on this page
    this.salesforceResponse = this.dataStorageService.getSalesforceResponse();
    // this.quoteWithProductDetails = this.salesforceResponse?.data?.quoteWithProductDetails;
    this.matchScoreResponse = this.matchScoreStorageService.getMatchScoreResponse();
    this.quoteWithProductDetails = this.matchScoreResponse?.data;
    
    if (!this.salesforceResponse) {
      Swal.fire({
        title: 'Session Expired',
        text: 'Your session has expired. Please complete the form again from the beginning.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#FF5A5F'
      }).then((result) => {
        if (result.value) {
          localStorage.clear();
          this.router.navigate(['/home']);
        }
      });
    } else if (this.isBrowser) {
      const mailform = localStorage.getItem('virtualdata');
      const mailform2 = localStorage.getItem('virtualdata1');
      const mailform3 = localStorage.getItem('virtualdata2');

      if (!mailform || !mailform2) {
        this.router.navigate(['/home']);
      } else {
        this.personalInfo = JSON.parse(mailform);
        this.companyInfo = JSON.parse(mailform2);

        const shareholdersFromMailform2 = this.companyInfo.shareholders || [];
        const additionalShareholderInfo = mailform3 ? JSON.parse(mailform3) : { companyTradeLicense: '', shareholders: [] };

        const mergedShareholders = additionalShareholderInfo.shareholders.length > 0 
          ? additionalShareholderInfo.shareholders 
          : shareholdersFromMailform2;



          if (!this.salesforceResponse || !this.salesforceResponse.data || !this.salesforceResponse.data.leadWithDetails) {
            console.error("salesforceResponse.data.leadWithDetails is not ready or missing");
            return;
          }
          
          const LeadId = this.salesforceResponse?.data?.leadWithDetails?.LeadId;
          if (!LeadId) {
            console.error("LeadId is not found in salesforceResponse.data.leadWithDetails");
          }
      

        const mergedData = {
          ...this.personalInfo,
          ...this.companyInfo,
          companyTradeLicense: additionalShareholderInfo.companyTradeLicense,
          shareholders: mergedShareholders,
          LeadId
        };

        localStorage.setItem('mergedData', JSON.stringify(mergedData));
        this.displayShareholders = Array.isArray(mergedData.shareholders)
          ? mergedData.shareholders
          : Object.values(mergedData.shareholders || []);
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      AOS.init();
      this.initializeJQueryFunctions();
    }
  }

  preventBackNavigation() {
    history.pushState(null, '', window.location.href);

    // Listen for popstate event to handle the back button navigation consistently
    window.addEventListener('popstate', () => {
      history.pushState(null, '', window.location.href);
      this.toastr.error('Back navigation is disabled on this page.', 'Warning');
      // Reload the page to reset the state
      setTimeout(() => {
        window.location.reload();
      }, 50);
    });
  }

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
    const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');
  
    this.userService.virtualForm(mergedData).subscribe(
      response => {
        // console.log('Data submitted successfully:', response);
        // this.toastr.success('Data submitted successfully', 'Success');
  
        // Retrieve quotePaymentId from the response instead of salesforceResponse
        const quotePaymentId = this.salesforceResponse?.data?.quotePaymentWithDetails?.QuotePaymentId;

        // console.log(quotePaymentId)
        if (quotePaymentId) {

          // console.log("quotePaymentId")
          localStorage.removeItem('virtualdata');
          localStorage.removeItem('virtualdata1');
          localStorage.removeItem('virtualdata2');
          // localStorage.clear();
          this.router.navigate([`/onlinepayment/${quotePaymentId}`]);
          // window.location.href = paymentUrl;
          // return of(null);
        } else {
          console.error('Quote Payment ID not found');
          this.toastr.error('Quote Payment ID not found', 'Error');
        }
      },
      error => {
        console.error('Error submitting data:', error);
        this.showError(error.error.message || 'An error occurred');
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
    return scrollPosition > 100 ? 'toast-bottom-right' : 'toast-bottom-left';
  }
}
