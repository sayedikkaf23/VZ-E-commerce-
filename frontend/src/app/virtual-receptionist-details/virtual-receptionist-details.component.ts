import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // For toast notifications
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import AOS from 'aos';
import { FileStorageService } from '../service/files.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { DataStorageService } from '../service/data-storage.service'; // Import the service
import { VirtualManagementService } from '../service/virtual-management.service';
import { MatchScoreStorageService } from '../service/matchscore-storage.service';
import { GetnationalityService } from '../service/getnationality.service';
import { ChangeDetectorRef } from '@angular/core';
interface Nationality {
  common: string;
  country: string;
}
declare var $: any;

@Component({
  selector: 'app-virtual-receptionist-details',
  templateUrl: './virtual-receptionist-details.component.html',
  styleUrl: './virtual-receptionist-details.component.css',
})
export class VirtualReceptionistDetailsComponent {
  isLoading = false;
  nationalities: Nationality[] = [];
  showAll = false;
  displayShareholders: any = [];
  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
  companyInfo: any = {}; // To store bank service information (Step 2 data)
  shareholders: any = [];
  tradeLicenseFile: any = {};
  uploadedFiles: File[][] = []; // Initialize as an empty array

  i: any;
  tradeLicenseFileurl: any;
  serviceProducts: any[] | undefined;
  constructor(
    private http: HttpClient,
    private toastr: ToastrService, // For showing notifications
    private router: Router,
    private userService: UserService,
    private fileStorageService: FileStorageService,
    private dataStorageService: DataStorageService,
    private virtualManagementService: VirtualManagementService,
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
    const mailform = localStorage.getItem('virtualdata');
    const mailform2 = localStorage.getItem('virtualdata1');
    const mailform3 = localStorage.getItem('virtualdata2');
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

      // Extract shareholders from mailform2 in case mailform3 is missing
      let shareholdersFromMailform2 = this.companyInfo.shareholders || [];
      this.tradeLicenseFile = mailform3 ? JSON.parse(mailform3) : {};
      // Parse mailform3 only if it exists
      const additionalShareholderInfo = mailform3
        ? JSON.parse(mailform3)
        : { companyTradeLicense: '', shareholders: [] };

      // Use shareholders from mailform3 if available, otherwise fallback to mailform2
      const mergedShareholders =
        additionalShareholderInfo.shareholders.length > 0
          ? additionalShareholderInfo.shareholders
          : shareholdersFromMailform2;

      // Merge all data into a single object
      const mergedData = {
        ...this.personalInfo,
        ...this.companyInfo,
        companyTradeLicense: additionalShareholderInfo.companyTradeLicense,
        shareholders: mergedShareholders,
      };

      // Store merged data in localStorage for the final step
      localStorage.setItem('mergedData', JSON.stringify(mergedData));

      // Assign displayShareholders
      this.displayShareholders = Array.isArray(mergedData.shareholders)
        ? mergedData.shareholders
        : Object.values(mergedData.shareholders || []);

      this.tradeLicenseFileurl =
        additionalShareholderInfo.companyTradeLicenseFile[0].url;

      // console.log("Merged Data:", mergedData, this.displayShareholders);
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
    if (this.isBrowser) {
      // Ensure AOS and jQuery code runs only in the browser
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
      positionClass: this.getToastPosition(),
    });
  }

  // Dynamically adjust the toastr position based on user scrolling
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    // console.log(scrollPosition); // You can log this to see how far the user has scrolled
  }

  // Function to determine the toast position based on scroll
  getToastPosition(): string {
    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
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

  // submitData() {
  //   // Combine personalInfo and bankInfo into finalData
  //   const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');
 
  //   // Show a SweetAlert confirmation dialog
  //   Swal.fire({
  //     title: 'Confirm Your Data',
  //     text: "Once you move forward, you won't be able to edit your information. Please review and confirm your details.",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#FA2E52',
  //     confirmButtonText: 'Yes, I confirm',
  //     cancelButtonText: 'Review Data',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const birthday = new Date(mergedData.birthday);
  //       const formattedBirthday = `${(birthday.getMonth() + 1)
  //         .toString()
  //         .padStart(2, '0')}/${birthday
  //         .getDate()
  //         .toString()
  //         .padStart(2, '0')}/${birthday.getFullYear()}`;
 
  //       // const payload = {
  //       //   firstName: mergedData.firstName,
  //       //   lastName: mergedData.lastName,
  //       //   email: mergedData.email,
  //       //   nationality: mergedData.nationality,
  //       //   phone: mergedData.mobileNumber, // Ensure to map this correctly
  //       //   dob: formattedBirthday,
  //       //   service: 'virtual_reception',
  //       //   CustomerType: 'C',
  //       //   shareholders: this.displayShareholders,
  //       //   planname: 'Virtual Receptionist',
  //       //   isProfile: false,
  //       //   tradeLicenseFileUrl: this.tradeLicenseFileurl,
  //       // };
 
  //       // const payload = {
  //       //   country: mergedData.nationality,
  //       // };
  //       const nationality = mergedData.nationality;
  //     const match = this.nationalities.find(
  //       (item) => item.common.toLowerCase() === nationality.toLowerCase()
  //     );
 
   
  //     const appliedRiskData = JSON.parse(localStorage.getItem('appliedRisk') || '{}');
 
  //     // 4. Final payload
  //     let riskCode;
  //     switch (appliedRiskData.appliedRisk) {
  //       case 'Low':
  //         riskCode = 1;
  //         break;
  //       case 'Medium':
  //         riskCode = 2;
  //         break;
  //       case 'High':
  //         riskCode = 3;
  //         break;
  //       default:
  //         riskCode = 0; // Default to 0 if no match
  //         break;
  //     }
       
       
  //       const payload = {
  //         ServiceNameCode: 3,
  //         SubTypeCode:15,
  //         RiskCode:riskCode,
       
  //       };
  //       this.isLoading = true; // Show loading indicator if necessary
 
   
 
  //       this.virtualManagementService.getServiceProducts(payload).subscribe(
  //         (response: any) => {
  //           this.isLoading = false;
 
  //           // Store final merged data
  //           localStorage.setItem('finalDataVirtual', JSON.stringify(mergedData));
 
  //           // Save product data
  //           localStorage.setItem('VirtualServiceProducts', JSON.stringify(response));
  //           console.log(response.data,"s")
  //           this.matchScoreStorageService.setMatchScoreResponse(response);
 
  //           // Navigate to summary page
  //           this.router.navigate(['/virtual-summary']);
  //         },
  //           (error) => {
  //             // On error: hide loader and show a SweetAlert with Retry and Cancel options
  //             this.isLoading = false;
  //             console.error(error);
  //             Swal.fire({
  //               title: 'Error',
  //               text: 'Something went wrong. Would you like to retry?',
  //               icon: 'error',
  //               showCancelButton: true,
  //               confirmButtonText: 'Retry',
  //               cancelButtonText: 'Cancel',
  //             }).then((retryResult) => {
  //               if (retryResult.isConfirmed) {
  //                 // If the user clicks Retry, re-call submitData() to reattempt the submission
  //                 this.submitData();
  //               }
  //             });
  //           }
  //         );
  //     }
  //     // No action needed if the user cancels the confirmation (they can review their data)
  //   });
  // }


submitData() {
  const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');
  const uploadedFileNames = this.tradeLicenseFile?.uploadedFileNames || [];
  const shareholdersData = mergedData?.shareholders || [];

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

    this.isLoading = true;

    const appliedRiskData = JSON.parse(localStorage.getItem('appliedRisk') || '{}');
    const riskCode = appliedRiskData.appliedRisk === 'Low' ? 1 :
                     appliedRiskData.appliedRisk === 'Medium' ? 2 :
                     appliedRiskData.appliedRisk === 'High' ? 3 : 0;

    const productRequestPayload = {
      ServiceNameCode: 3,
      SubTypeCode: 15,
      RiskCode: riskCode
    };

    this.virtualManagementService.getServiceProducts(productRequestPayload).pipe(
      catchError(error => {
        this.isLoading = false;
        console.error(error);
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

        localStorage.setItem('finalDataVirtual', JSON.stringify(mergedData));
        localStorage.setItem('VirtualServiceProducts', JSON.stringify(serviceResponse));
        this.matchScoreStorageService.setMatchScoreResponse(serviceResponse);

        const serviceProducts = Array.isArray(serviceResponse) ? serviceResponse : [serviceResponse];
        this.serviceProducts = serviceProducts;

        const paymentPayload = {
          firstName: this.personalInfo.firstName,
          lastName: this.personalInfo.lastName,
          email: this.personalInfo.email,
          nationality: this.personalInfo.nationality,
          phone: this.personalInfo.mobileNumber.number,
          countryCode: this.personalInfo.mobileNumber.dialCode,
          dob: this.personalInfo.birthday,
          type: "Virtual Receptionist",
          CustomerType: "C",
          uploadedFileNames,
          prodcutNameList: serviceProducts.map(product => ({
            ProductName: product.Product_Name,
            ProductFamily: "Virtual Receptionist",
            ProductDescription: "Service for UAE Resident",
            ProductCurrencyName: product.Currency_Code,
            ProductUnitprice: product.price,
            ProductQuantity: 1,
            ProductDiscount: 0,
              vat: product.vat,
          })),
          shareholders: shareholdersData.map((s: { name: any; shareholderPercentage: any; dob: any; nationalityshareholder: any; countryRisk: any; files: any; }) => ({
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
          map(digiRes => ({
            quotePaymentId,
            leadId: digiRes?.screeningmatchScore?.customerId || null
          }))
        );
      }),
      switchMap(({ quotePaymentId, leadId }) => {
        if (!leadId) throw new Error('Missing LeadId from digicomplice');

        const documentPayload = {
          quotePaymentId,
          serviceName: 'Virtual Receptionist',
          shareholders: shareholdersData.map((s: { name: any; shareholderPercentage: any; dob: any; nationalityshareholder: any; files: { name: any; url: any; type: any; oopId: any; }[]; }) => ({
            name: s.name,
            shareholderPercentage: s.shareholderPercentage,
            dob: s.dob,
            nationalityshareholder: s.nationalityshareholder,
            files: s.files?.map((f: { name: any; url: any; type: any; oopId: any; }) => ({
              name: f.name,
              url: f.url,
              type: f.type,
              oopId: f.oopId
            })) || []
          }))
        };

        return this.userService.insertShareholderDocuments(
          documentPayload.quotePaymentId,
          documentPayload.serviceName,
          documentPayload.shareholders
        ).pipe(
          switchMap(() => {
            return this.userService.checkStatus({
              CustomerId: leadId,
              CompanyName: 'Virtuzone'
            }).pipe(
              tap(statusRes => {
                this.isLoading = false;
                if (statusRes?.data?.CustomerStatus === 'Auto Approved') {
                  localStorage.setItem('quotePaymentId', documentPayload.quotePaymentId);
                  this.router.navigate(['/virtual-summary']);
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
    this.displayShareholders = this.showAll
      ? this.shareholders
      : this.shareholders.slice(0, 5);
  }
}
