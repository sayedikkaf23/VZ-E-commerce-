import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // For toast notifications
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import AOS from 'aos';
import { FileStorageService } from '../service/files.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { DataStorageService } from '../service/data-storage.service'; // Import the service
import { MailManagementService } from '../service/mail-management.service';
import { MatchScoreStorageService } from '../service/matchscore-storage.service';
import { GetnationalityService } from '../service/getnationality.service';
import { ChangeDetectorRef } from '@angular/core';
interface Nationality {
  common: string;
  country: string;
}
declare var $: any;



@Component({
  selector: 'app-mails-management-show-details',
  templateUrl: './mails-management-show-details.component.html',
  styleUrl: './mails-management-show-details.component.css'
})
export class MailsManagementShowDetailsComponent {

  isLoading = false;
  nationalities: Nationality[] = [];
  showAll = false;
  displayShareholders :any= [];
  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
 companyInfo: any = {}; // To store bank service information (Step 2 data)
 tradeLicenseFile: any = {}; // To store bank service information (Step 2 data)
 shareholders :any= [];
 uploadedFiles: File[][] = []; // Initialize as an empty array
i: any;
leadId: any;

  tradeLicenseFileurl: any;
  serviceProducts: any[] | undefined;
 constructor(
    private http: HttpClient,
    private toastr: ToastrService, // For showing notifications
    private router: Router,
    private userService: UserService,
    private mailManagementService: MailManagementService,
    private fileStorageService: FileStorageService,
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
     const leadDataRaw = sessionStorage.getItem('leadResponse');
  const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;
   this.leadId = leadData?.LeadId;
   if (this.leadId) {
  // 1) getStep1 → personalInfo
  this.userService.getStep1(this.leadId).subscribe({
    next: (personalInfo: any) => {
      this.personalInfo = personalInfo;

        // 3) getTradeLicenseandShareholder → tradeLicenseFile etc.
          this.userService.getTradeLicenseAndShareholders(this.leadId).subscribe({
            next: (tradeData: any) => {
              this.tradeLicenseFile = tradeData || {};
console.log("Trade License Data:", tradeData);
              this.shareholders = tradeData.shareholders || []; 
             
           this.uploadedFiles = tradeData.uploadedFileNames || []; // Initialize uploadedFiles with the data from tradeData
            // Save shareholders
            this.shareholders = Array.isArray(tradeData.shareholders) ? tradeData.shareholders : [];

            // Default to first 5 shareholders
            this.displayShareholders = this.shareholders.slice(0, 5);

            // Trade license file URL
            this.tradeLicenseFileurl = Array.isArray(tradeData.companyTradeLicenseFile) && tradeData.companyTradeLicenseFile.length > 0
              ? tradeData.companyTradeLicenseFile[0].url
              : '';

            this.cdRef.detectChanges();
            
            },
            error: (err:any) => {
              console.error('Failed to load trade license data:', err);
              this.toastr.error('Could not load trade license data.', 'Error');
            }
          });

        },
    
    error: (err) => {
      console.error('Failed to load step1/personal data:', err);
      this.toastr.error('Could not load personal data.', 'Error');
    }
  });


  
    // if (tradeLicenseFile.length > 0) {
    //   // Assuming you need the first file
    //   const tradeLicenseFileDetails = tradeLicenseFile[0];
    //   console.log("Trade License File Details:", tradeLicenseFileDetails);

    //   // Example usage: assigning to a variable
    //   this.tradeLicenseFileName = tradeLicenseFileDetails.name;
    //   this.tradeLicenseFileurl = tradeLicenseFileDetails.url;
    // }

   
    }
  
    // console.log(this.displayShareholders, "sas");
  }
  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Method to show image preview
  showImagePreview(file: File): void {
    const imageUrl = this.getFileUrl(file);
    // Open the image in a new tab for preview
    window.open(imageUrl, '_blank');

    // Clean up the object URL when it's no longer needed
    setTimeout(() => URL.revokeObjectURL(imageUrl), 1000); // Revoke URL after 1 second
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


 
submitData() {

  const uploadedFileNames = this.uploadedFiles || [];
  const shareholdersData = this.shareholders || [];

  

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
    const leadPayload = {
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
    const riskCode = appliedRiskData.appliedRisk === 'Low' ? 1 :
                     appliedRiskData.appliedRisk === 'Medium' ? 2 :
                     appliedRiskData.appliedRisk === 'High' ? 3 : 0;

    const payload = {
      ServiceNameCode: 2,
      SubTypeCode: 16,
      RiskCode: riskCode,
    };

    this.isLoading = true;

    of(quotePaymentId).pipe(
      switchMap(id => {
        if (id) {
          return this.userService.createLeadOnly(leadPayload).pipe(
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
      switchMap(() =>this.mailManagementService.getServiceProducts(payload)),
      catchError(error => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'Something went wrong. Would you like to retry?',
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Retry',
          cancelButtonText: 'Cancel'
        }).then((retryResult) => {
          if (retryResult.isConfirmed) this.submitData();
        });
        return of(null);
      }),
      switchMap((serviceResponse: any) => {
        if (!serviceResponse) return of(null);


        sessionStorage.setItem('MailServiceProducts', JSON.stringify(serviceResponse));
        this.matchScoreStorageService.setMatchScoreResponse(serviceResponse);

        const serviceProducts = Array.isArray(serviceResponse) ? serviceResponse : [serviceResponse];
        this.serviceProducts = serviceProducts;
         const leadResponseRaw = sessionStorage.getItem('leadResponse');
        const leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};

        const paymentPayload = {
          LeadId: leadResponse.LeadId || '',
          isLead: true,
          AccountId: leadResponse.AccountId || '',
          ContactId: leadResponse.ContactId || '',
          firstName: this.personalInfo.FirstName,
          lastName: this.personalInfo.LastName,
          email: this.personalInfo.Email,
          nationality: this.personalInfo.Nationality,
          phone: this.personalInfo.Phone,
          countryCode: this.personalInfo.countryCode,
          dob: this.personalInfo.dob,
           companyName: this.personalInfo.Company,
            companyLicensed: this.personalInfo.companyLicensed,
            activityType: this.personalInfo.activityType,
           totalShareholders: this.personalInfo.totalShareholders ,
           serviceName: 'Mail Management',
           subServiceName: 'Mail Management',
            companyLocation: this.personalInfo.companyLocation,
            companyWebsite: this.personalInfo.companyWebsite,
             tradeLicenseFile:[
            {
              name: this.tradeLicenseFile.tradeLicenseFile?.[0]?.name || '',
              type: this.tradeLicenseFile.tradeLicenseFile?.[0]?.type || '',
              License_no: this.tradeLicenseFile.tradeLicenseNo || '',
              url: this.tradeLicenseFile.tradeLicenseFileUrl || '',
                AccountId: leadResponse.AccountId || '',
            }
          ],
            tradeLicenseNo: this.tradeLicenseFile.tradeLicenseNo || '',
            tradeLicenseFileUrl: this.tradeLicenseFile.tradeLicenseFileUrl,
           shareholdersfiles: (this.shareholders || [])
            .flatMap((s: any) => Array.isArray(s.files) ? s.files : [])
            .map((f: any) => f.url)
            .filter(Boolean)[0] || '',

          type: "Mail Management",
          CustomerType: "C",
          uploadedFileNames,
          prodcutNameList: serviceProducts.map(product => ({
            ProductName: product.Product_Name,
            ProductFamily: "Mail Management",
            ProductDescription: "Service for UAE Resident",
            ProductCurrencyName: product.Currency_Code,
            ProductUnitprice: product.price,
            ProductQuantity: 1,
            ProductDiscount: 0,
            vat: product.vat,
            ProductId: product.Product_Id,  

          })),
          shareholders: (this.shareholders || []).map((s: any) => ({
            name: s.name,
            shareholderPercentage: s.shareholderPercentage,
            dob: s.dob,
            passportNumber: s.passportNumber,
            nationalityshareholder: s.nationalityshareholder,
            countryRisk: s.countryRisk,
            files: s.files || []
          }))

        };

        return this.userService.createPaymentOpportunity(paymentPayload);
      }),
      switchMap((paymentOpportunityResponse: any) => {
        if (!paymentOpportunityResponse.salesforceResponse?.QuotePaymentId) throw new Error('Missing QuotePaymentId');

        const quotePaymentId = paymentOpportunityResponse.salesforceResponse.QuotePaymentId;

  const shareholders = (paymentOpportunityResponse.pidata.shareholders || []).map(
    (s: any) => ({
      name: s.name,
      shareholderPercentage: s.shareholderPercentage,
      dob: s.dob,
      nationalityshareholder: s.nationalityshareholder,
      passportNumber: s.passportNumber,
      files: (s.files || []).map((f: any) => ({
        name: f.name,
        url: f.url,
        type: f.type,
        oopId:  paymentOpportunityResponse.salesforceResponse.OpportunityId || null   
      })),
    })
  );
        return this.userService.digicomplice({
          CustomerId: quotePaymentId,
          CompanyName: 'Virtuzone'
        }).pipe(
          map(secondRes => ({
            quotePaymentId,
            leadId: secondRes?.screeningmatchScore?.customerId || null,
            shareholders
          }))
        );
      }),
      switchMap(({ quotePaymentId, leadId,shareholders }) => {
        if (!leadId) throw new Error('Missing LeadId from digicomplice');
        const uploadedFilesArray = Array.isArray(this.tradeLicenseFile.uploadedFileNames)
          ? this.tradeLicenseFile.uploadedFileNames
          : Object.values(this.tradeLicenseFile.uploadedFileNames || {}).flat();
          const accountId = sessionStorage.getItem('accountId');
          const leadResponseRaw = sessionStorage.getItem('leadResponse');
            const leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};
        const documentPayload = {
          quotePaymentId,
             AccountId: leadResponse.AccountId || '',
          serviceName: 'Mail Management',
          tradelicense: [
            {
               name: this.tradeLicenseFile.tradeLicenseFile?.[0]?.name || '',
              type: this.tradeLicenseFile.tradeLicenseFile?.[0]?.type || '',
              License_no: this.tradeLicenseFile.tradeLicenseNo || '',
              url: this.tradeLicenseFile.tradeLicenseFileURL || '',
                AccountId: leadResponse.AccountId || '',
            }
          ],
        shareholders,

        
        };

        return this.userService.insertShareholderDocuments(
          documentPayload.quotePaymentId,
          documentPayload.AccountId,
          documentPayload.serviceName,
          documentPayload.tradelicense,
          documentPayload.shareholders
        ).pipe(
          switchMap(() => {
            return this.userService.checkStatus({
              CustomerId: leadId,
              CompanyName: 'Virtuzone'
            }).pipe(
              tap(statusRes => {
                if (statusRes?.data?.CustomerStatus === 'Auto Approved') {
                  sessionStorage.setItem('quotePaymentId', documentPayload.quotePaymentId);
                  this.router.navigate(['/mails-summary']);
                } else {
                  alert('Your request has been submitted successfully. You will receive an email when your application is approved.');
                  this.router.navigate([`/failure/${documentPayload.quotePaymentId}`]);
                }
              })
            );
          })
        );
      })
    ).subscribe({
      next: () => this.isLoading = false,
      error: err => {
        this.isLoading = false;
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.message || 'An error occurred',
          showCancelButton: true,
          confirmButtonText: 'Retry',
          cancelButtonText: 'Cancel',
        }).then(result => {
          if (result.isConfirmed) this.submitData();
        });
      }
    });
  });
}






isImageFile(url: string): boolean {
  return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
}


  toggleView() {
    this.showAll = !this.showAll;
    this.displayShareholders = this.showAll ? this.shareholders : this.shareholders.slice(0, 5);
  }
}

