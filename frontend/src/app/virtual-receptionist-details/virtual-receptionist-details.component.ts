import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // For toast notifications
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import AOS from 'aos';
import { FileStorageService } from '../service/files.service';
import { switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { DataStorageService } from '../service/data-storage.service'; // Import the service
import { VirtualManagementService } from '../service/virtual-management.service';
import { MatchScoreStorageService } from '../service/matchscore-storage.service';

declare var $: any;


@Component({
  selector: 'app-virtual-receptionist-details',
  templateUrl: './virtual-receptionist-details.component.html',
  styleUrl: './virtual-receptionist-details.component.css'
})
export class VirtualReceptionistDetailsComponent {
  isLoading = false;

  showAll = false;
  displayShareholders :any= [];
  isBrowser: boolean;
  personalInfo: any = {}; // To store personal information (Step 1 data)
 companyInfo: any = {}; // To store bank service information (Step 2 data)
 shareholders :any= [];
 uploadedFiles: File[][] = []; // Initialize as an empty array
i: any;
  tradeLicenseFileurl: any;
 constructor(
    private http: HttpClient,
    private toastr: ToastrService, // For showing notifications
    private router: Router,
    private userService: UserService,
    private fileStorageService: FileStorageService,
    private dataStorageService: DataStorageService,
    private virtualManagementService: VirtualManagementService,
    private matchScoreStorageService: MatchScoreStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Check if the platform is a browser
  }

  ngOnInit(): void {
    const mailform = localStorage.getItem('virtualdata');
    const mailform2 = localStorage.getItem('virtualdata1');
    const mailform3 = localStorage.getItem('virtualdata2');
  
    // Redirect if either mailform or mailform2 is missing
    if (!mailform || !mailform2) {
      this.router.navigate(['/home']);
    } else {
      // Parse data from localStorage
      this.personalInfo = JSON.parse(mailform);
      this.companyInfo = JSON.parse(mailform2);
  
      // Extract shareholders from mailform2 in case mailform3 is missing
      let shareholdersFromMailform2 = this.companyInfo.shareholders || [];
  
      // Parse mailform3 only if it exists
      const additionalShareholderInfo = mailform3 ? JSON.parse(mailform3) : { companyTradeLicense: '', shareholders: [] };
  
      // Use shareholders from mailform3 if available, otherwise fallback to mailform2
      const mergedShareholders = additionalShareholderInfo.shareholders.length > 0 
        ? additionalShareholderInfo.shareholders 
        : shareholdersFromMailform2;
  
      // Merge all data into a single object
      const mergedData = {
        ...this.personalInfo,
        ...this.companyInfo,
        companyTradeLicense: additionalShareholderInfo.companyTradeLicense,
        shareholders: mergedShareholders
      };
  
      // Store merged data in localStorage for the final step
      localStorage.setItem('mergedData', JSON.stringify(mergedData));
     
      // Assign displayShareholders
      this.displayShareholders = Array.isArray(mergedData.shareholders)
        ? mergedData.shareholders
        : Object.values(mergedData.shareholders || []);
  

        this.tradeLicenseFileurl  = additionalShareholderInfo.companyTradeLicenseFile[0].url;

      console.log("Merged Data:", mergedData, this.displayShareholders);
    }
  
    console.log(this.displayShareholders, "sas");
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
    console.log(scrollPosition); // You can log this to see how far the user has scrolled
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
  // Combine personalInfo and bankInfo into finalData

  const mergedData = JSON.parse(localStorage.getItem('mergedData') || '{}');

  // Show a SweetAlert confirmation dialog
  Swal.fire({
    title: 'Confirm Your Data',
    text: 'Once you proceed to the next step, you won’t be able to edit your information. Please confirm your data.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#FA2E52',
    confirmButtonText: 'Yes, I confirm',
    cancelButtonText: 'Review Data'
  }).then((result) => {
    if (result.isConfirmed) {
      // const payload = {
      //   firstName: mergedData.firstName,
      //   lastName: mergedData.lastName,
      //   email: mergedData.email,
      //   nationality: mergedData.nationality,
      //   phone: mergedData.mobileNumber, // Ensure to map this correctly
      //   dob: mergedData.birthday,
      //   service: "virtual_reception"
      // };

      const payload = {
        firstName: mergedData.firstName,
        lastName: mergedData.lastName,
        email: mergedData.email,
        nationality: mergedData.nationality,
        phone: mergedData.mobileNumber, // Ensure to map this correctly
        dob: mergedData.birthday,
        service: "virtual_reception",
        CustomerType:'C',
        shareholders:   this.displayShareholders,
        planname:  "Virtual Reception",
        isProfile:  false,
        tradeLicenseFileUrl: this.tradeLicenseFileurl,
      };

      this.isLoading = true; // Show loading indicator if necessary

      // First API call to callSalesforceEndpoint
      this.virtualManagementService.callSalesforceEndpoint(payload).pipe(
        switchMap((response: any) => {
          console.log('Salesforce Response:', response);
          this.dataStorageService.setSalesforceResponse(response);
          // Prepare payload for the second API call
          const quotePayload = {
            lead_source: response.data.leadWithDetails.LeadSource,
            currencyCode: response.data.quotePaymentWithDetails.Currency, // Update this as needed
            quotePaymentId: response.data.quotePaymentWithDetails.QuotePaymentId, // Assuming the response has quotePaymentId
            account_id: response.data.quotePaymentWithDetails.AccountId, // Assuming the response has account_id
            payment_url: `https://ecommerce.yeepeey.com/onlinepayment/${response.data.quotePaymentWithDetails.QuotePaymentId}`
          };
          // Call the second API
          return this.userService.callSalesforceQuoteService(quotePayload).pipe(
            switchMap((quoteResponse: any) => {
              console.log('Quote Service Response:', quoteResponse);

              // Prepare payload for MatchScoreProductService
              const matchScorePayload = {
                quotePaymentId: quotePayload.quotePaymentId,
                accountId: quotePayload.account_id,
                leadId: response.data.leadWithDetails.LeadId, // Assuming leadId is part of the response
                matchScore: response.screeningmatchScore.matchScore, // Adjust based on response structure
              };

              // Call the third API
              return this.userService.MatchScoreProductService(matchScorePayload);
            })
          );
        })
      ).subscribe(
        (quoteResponse: any) => {
          console.log('Quote Service Response:', quoteResponse);
          this.isLoading = false; // Hide loader

          // Save finalData in localStorage
          localStorage.setItem('finalDataVirtual', JSON.stringify(mergedData));
          this.matchScoreStorageService.setMatchScoreResponse(quoteResponse);
          // Navigate to the next step
          this.router.navigate(['/virtual-summary']); // Replace with your actual route
        },
        (error) => {
          // Handle errors from the Salesforce API calls
          Swal.fire('Error', 'There was an error processing your request. Please try again.', 'error');
          console.error(error);
          this.isLoading = false; // Hide loader in case of error
        }
      );
    }
    // No action needed if the user cancels the confirmation
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

