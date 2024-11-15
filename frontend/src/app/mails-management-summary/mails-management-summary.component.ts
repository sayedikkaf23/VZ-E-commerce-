import { isPlatformBrowser, LocationStrategy } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { DataStorageService } from '../service/data-storage.service';
import AOS from 'aos';
import Swal from 'sweetalert2';

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
  salesforceResponse: any;
  quoteWithProductDetails: any;
  showAll = false;
  displayShareholders: any = [];
  companyInfo: any = {};
  shareholders: any = [];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private dataStorageService: DataStorageService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private locationStrategy: LocationStrategy // Inject LocationStrategy for back navigation control
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.preventBackNavigation(); // Prevent back navigation on this page
    this.salesforceResponse = this.dataStorageService.getSalesforceResponse();
    this.quoteWithProductDetails = this.salesforceResponse?.data?.quoteWithProductDetails;

    if (!this.salesforceResponse) {
      Swal.fire({
        title: 'Session Terminated',
        text: 'Your session has expired. You need to fill the form from the start.',
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
      const mailform = localStorage.getItem('mailform');
      const mailform2 = localStorage.getItem('mailform1');
      const mailform3 = localStorage.getItem('mailform2');
    
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
  
    this.userService.mailform(mergedData).subscribe(
      response => {
        console.log('Data submitted successfully:', response);
        this.toastr.success('Data submitted successfully', 'Success');
  
        // Retrieve quotePaymentId from the response instead of salesforceResponse
        const quotePaymentId = this.salesforceResponse?.data?.quotePaymentWithDetails?.QuotePaymentId;

        console.log(quotePaymentId)
        if (quotePaymentId) {

          console.log("quotePaymentId")
          
          localStorage.clear();
          const paymentUrl = `https://virtuzone.yeepeey.com/onlinepayment/${quotePaymentId}`;
          window.location.href = paymentUrl; // Redirect to payment URL
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
