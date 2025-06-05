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
    const mailform = localStorage.getItem('mailform');
    const mailform2 = localStorage.getItem('mailform1');
    const mailform3 = localStorage.getItem('mailform2') ;

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
    // Redirect if either mailform or mailform2 is missing
    if (!mailform || !mailform2) {
      this.router.navigate(['/home']);
    } else {
      // Parse data from localStorage
      this.personalInfo = JSON.parse(mailform);
      this.companyInfo = JSON.parse(mailform2);
      this.tradeLicenseFile = mailform3 ? JSON.parse(mailform3) : {};

  
  
      // Extract shareholders from mailform2 in case mailform3 is missing
      let shareholdersFromMailform2 = this.companyInfo.shareholders || [];
  
      // Parse mailform3 only if it exists
      const additionalShareholderInfo = mailform3 ? JSON.parse(mailform3) : { companyTradeLicense: '', shareholders: [] };
  // console.log(additionalShareholderInfo,"additionalShareholderInfo")
      // Use shareholders from mailform3 if available, otherwise fallback to mailform2
      const mergedShareholders = additionalShareholderInfo.shareholders.length > 0 
        ? additionalShareholderInfo.shareholders 
        : shareholdersFromMailform2;
  
      // Merge all data into a single object
      const mergedData = {
        ...this.personalInfo,
        ...this.companyInfo,
        companyTradeLicense: additionalShareholderInfo.companyTradeLicense,
        shareholders: mergedShareholders,
        ...this.tradeLicenseFile
      };
  
      // Store merged data in localStorage for the final step
      localStorage.setItem('mergedData', JSON.stringify(mergedData));
  
      // Assign displayShareholders
      this.displayShareholders = Array.isArray(mergedData.shareholders)
        ? mergedData.shareholders
        : Object.values(mergedData.shareholders || []);
  
      // console.log("Merged Data:", mergedData, this.displayShareholders);


      //  const tradeLicenseFile = this.companyInfo.companyTradeLicenseFile || [];
       this.tradeLicenseFileurl  = additionalShareholderInfo.companyTradeLicenseFile[0].url;
  
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
  // submitData() {
  //   const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');
  //   const formData = new FormData();
  
  //   // Append general data fields, excluding shareholders
  //   for (const key in mergedData) {
  //     if (mergedData.hasOwnProperty(key) && key !== 'shareholders') {
  //       const value = mergedData[key];
  //       formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
  //     }
  //   }
  
  //   // Append each shareholder's data and their actual File objects
  //   mergedData.shareholders.forEach((shareholder: any, index: number) => {
  //     // Append shareholder metadata fields, excluding files
  //     for (const field in shareholder) {
  //       if (field !== 'files') {
  //         formData.append(`shareholders[${index}][${field}]`, shareholder[field]);
  //       }
  //     }
  
  //     // Retrieve actual files from `fileStorageService`
  //     const files = this.fileStorageService.getFiles(index);
  //     if (files.length > 0) {
  //       files.forEach((file: File, fileIndex: number) => {
  //         formData.append(`shareholders[${index}][files][${fileIndex}]`, file);
  //       });
  //     } else {
  //       console.warn(`No files found for shareholder index ${index}`);
  //     }
  //   });
  
  //   // Log FormData to verify structure
  //   formData.forEach((value, key) => {
  //     console.log(`${key}:`, value);
  //   });
  
  //   // Send the data to backend
  //   this.userService.virtualform(formData).subscribe(
  //     response => {
  //       console.log('Data submitted successfully:', response);
  //       localStorage.clear();
  //       this.toastr.success('Data submitted successfully', 'Success');
  //     },
  //     error => {
  //       console.error('Error submitting data:', error);
  //       this.showError(error.error.message || 'An error occurred');
  //     }
  //   );
  // }
  
  
  
  
// VirtualReceptionist2Component.ts


 
submitData() {
  const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');
  const uploadedFileNames = this.uploadedFiles || [];
  const shareholdersData = this.shareholders || [];

  
console.log("object",mergedData,   this.tradeLicenseFile)
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

    const appliedRiskData = JSON.parse(localStorage.getItem('appliedRisk') || '{}');
    const riskCode = appliedRiskData.appliedRisk === 'Low' ? 1 :
                     appliedRiskData.appliedRisk === 'Medium' ? 2 :
                     appliedRiskData.appliedRisk === 'High' ? 3 : 0;

    const payload = {
      ServiceNameCode: 2,
      SubTypeCode: 16,
      RiskCode: riskCode,
    };

    this.isLoading = true;

    this.mailManagementService.getServiceProducts(payload).pipe(
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

        localStorage.setItem('finalDataMail', JSON.stringify(mergedData));
        localStorage.setItem('MailServiceProducts', JSON.stringify(serviceResponse));
        this.matchScoreStorageService.setMatchScoreResponse(serviceResponse);

        const serviceProducts = Array.isArray(serviceResponse) ? serviceResponse : [serviceResponse];
        this.serviceProducts = serviceProducts;
         const leadResponseRaw = localStorage.getItem('leadResponse');
        const leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};
        const paymentPayload = {
          LeadId: leadResponse.LeadId || '',
          AccountId: leadResponse.AccountId || '',
          ContactId: leadResponse.ContactId || '',
          firstName: this.personalInfo.firstName,
          lastName: this.personalInfo.lastName,
          email: this.personalInfo.email,
          nationality: this.personalInfo.nationality,
          phone: this.personalInfo.mobileNumber.number,
          countryCode: this.personalInfo.mobileNumber.dialCode,
          dob: this.personalInfo.birthday,
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
          })),
          shareholders: (mergedData.shareholders || []).map((s: any) => ({
            name: s.name,
            shareholderPercentage: s.shareholderPercentage,
            dob: s.dob,
            nationalityshareholder: s.nationalityshareholder,
            countryRisk: s.countryRisk,
            files: s.files || []
          }))

        };

        return this.userService.createPaymentOpportunity(paymentPayload);
      }),
      switchMap((paymentOpportunityResponse: any) => {
        if (!paymentOpportunityResponse?.QuotePaymentId) throw new Error('Missing QuotePaymentId');

        const quotePaymentId = paymentOpportunityResponse.QuotePaymentId;

        return this.userService.digicomplice({
          CustomerId: quotePaymentId,
          CompanyName: 'Virtuzone'
        }).pipe(
          map(secondRes => ({
            quotePaymentId,
            leadId: secondRes?.screeningmatchScore?.customerId || null
          }))
        );
      }),
      switchMap(({ quotePaymentId, leadId }) => {
        if (!leadId) throw new Error('Missing LeadId from digicomplice');
        const uploadedFilesArray = Array.isArray(this.tradeLicenseFile.uploadedFileNames)
          ? this.tradeLicenseFile.uploadedFileNames
          : Object.values(this.tradeLicenseFile.uploadedFileNames || {}).flat();
          const accountId = localStorage.getItem('accountId');
          const leadResponseRaw = localStorage.getItem('leadResponse');
            const leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};
        const documentPayload = {
          quotePaymentId,
             AccountId: leadResponse.AccountId || '',
          serviceName: 'Mail Management',
          tradelicense: [
            {
              License_no: this.tradeLicenseFile.companyTradeLicenseNumber || '',
              url: uploadedFilesArray.length > 0 ? uploadedFilesArray[0].url : '',
                AccountId: leadResponse.AccountId || '',
            }
          ],
          shareholders: (mergedData.shareholders || []).map((s: any) => ({
            name: s.name,
            shareholderPercentage: s.shareholderPercentage,
            dob: s.dob,
            nationalityshareholder: s.nationalityshareholder,
            files: (s.files || []).map((f: any) => ({
              name: f.name,
              url: f.url,
              type: f.type,
              oopId: f.oopId
            })) || []
          }))

        
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
                  localStorage.setItem('quotePaymentId', documentPayload.quotePaymentId);
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

