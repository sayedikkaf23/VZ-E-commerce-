import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {  FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import AOS from 'aos';
declare var $: any;


import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser to check the platform
import { UserService } from '../service/user.service';
import { Subscription } from 'rxjs';
import { FormDataService } from '../service/form-data.service';
@Component({
  selector: 'app-virtual-receptionist-1',
  templateUrl: './virtual-receptionist-1.component.html',
  styleUrl: './virtual-receptionist-1.component.css'
})
export class VirtualReceptionist1Component {

  
  companyLocation: string[] = [];
  companyDetailsForm: FormGroup;
  isBrowser: boolean;
  step1Data: any = {};
  myGroup: any;
   private subscription: Subscription = new Subscription; 
  
  shareholders: any[] = [];
  totalShareholders: number = 0;
  showShareholderList: boolean = false;
formData: any;
nationality: any;

  constructor(
    private formDataService: FormDataService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID to detect platform
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Check if the platform is a browser

    // Retrieve Step 1 data from the service when Step 2 initializes
    this.step1Data = this.formDataService.getmailmanagementData();
    console.log('mail form data:', this.step1Data);

    this.companyDetailsForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      selectedLocation: ['', Validators.required],
      totalShareholders: ['', Validators.required],
      companyWebsite: ['', [ Validators.minLength(6)]],
      activityType: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
    });
  }
  
  

  ngOnInit(): void {
    // Fetch nationalities using REST Countries API
    this.subscription=this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe((data) => {
      this.companyLocation = data.map((country) => country.name.common);
      this.cdRef.detectChanges(); // Manually trigger change detection to update the view
    });

    //for displaying shareholder list 


    this.totalShareholdersControl?.valueChanges.subscribe(value => {
      this.shareholders = [];// Clear existing shareholders
      this.showShareholderList = false; // Hide shareholder list initially
      if (value) {
        for (let i = 0; i < value; i++) {
          this.shareholders.push(this.createShareholderFormGroup());
        }
        this.showShareholderList = true; // Show shareholder list after adding
      }
    });

    

    // Check if we are in the browser before accessing localStorage
    if (this.isBrowser) {
      const storedData = localStorage.getItem('mail3');
      if (storedData) {
        const formData = JSON.parse(storedData);
        this.companyDetailsForm.patchValue(formData);
      }
    }
 }

   // Show one toaster for all invalid fields
   showSingleValidationError(formGroup: FormGroup) {
    const missingFields: string[] = []; // Explicitly define the type as string[]

    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control && control.invalid && control.errors?.['required']) {
        missingFields.push(this.getFieldName(field));
      }
    });

    if (missingFields.length > 0) {
      const message = `All fields are required`;
      this.toastr.error(message);
    }
   }

  getFieldName(field: string): string {
    switch (field) {
      case 'companyName':
        return 'Company Name';
      case 'selectedLoctaion':
        return 'Company Location';
      default:
        return field;
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Ensure DOM-related code runs only in the browser
      AOS.init(); // Initialize AOS animations

      $(window).scroll(() => {
        const height = $(window).scrollTop();
        if (height > 50) {
          $('html').addClass('sticky');
        } else {
          $('html').removeClass('sticky');
        }
      });

      $(document).ready(() => {
        $('.scrollToTop').click((event: any) => {
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
      });
    }
  }

  // Validate form and show a single toast for missing fields
  // validateForm(): boolean {
  //   let isValid = true;
  //   const missingFields: string[] = []; // Array to hold missing fields
    
      

  //   if (this.formData.selectedLocation) {
  //     missingFields.push('Select your Company Location');
  //     isValid = false;
  //   }

  //   if (this.formData.companyName) {
  //     missingFields.push('Enter Company Name');
  //     isValid = false;
  //   }

  //   if (this.formData.companyWebsite) {
  //     missingFields.push('Enter Company website');
  //     isValid = false;
  //   }


  //   // Show a single toast for all missing fields if any
  //   if (missingFields.length > 0) {
  //     const message = `All fields are required`;
  //     this.toastr.error(message);
  //   }

  //   return isValid;
  // }

  addShareholder() {
    console.log('Added shareholder list');
    this.shareholders.push({ name: '', phone: '', dob: '', nationality: '' });
    this.cdRef.detectChanges(); // Only if necessary
  }

// deleteShareholder(index: number) {
// this.shareholders.splice(index, 1); // Remove the shareholder at the specified index
// }

  createShareholderFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      dob: ['', Validators.required],
      nationality: ['', Validators.required]
    });
  }

  get totalShareholdersControl() {
    return this.companyDetailsForm.get('totalShareholders');
  }

  get selectedLocationControl() {
    return this.companyDetailsForm.get('selectedLocation');
  }


  onSubmit(){
    if (this.companyDetailsForm.valid) {
      const formData = this.companyDetailsForm.value;

      if (this.isBrowser) {
        localStorage.setItem('mail3', JSON.stringify(formData));
        



        // Check if step2Data exists in localStorage
        if (this.isBrowser) {
        if (!localStorage.getItem('mailmanagement')) {
          // If mailform2 data exists, navigate to MailMangamentShowDetails
          this.router.navigate(['/mailmanagement']);
        } 
        else if (!localStorage.getItem('mail3')) {
          // If step2Data exists, navigate to step-2
          this.router.navigate(['/mail3']);
        }
          else {
          // Otherwise, navigate to mailform
          this.router.navigate(['/BusinessBankShowDetails']);
        }
        }
      }
    } 
      
      else {
      // Show validation error messages in a single toast
      this.showSingleValidationError(this.companyDetailsForm);
    }

  //   if (this.validateForm()) {
  //     const formDataToSend = new FormData();

  //     // Append Step 1 data
  //     for (const key in this.step1Data) {
  //         if (this.step1Data.hasOwnProperty(key)) {
  //             formDataToSend.append(key, this.step1Data[key]);
  //             console.log("appended");
  //         }
  //     }

  //     // Append Step 2 data
  //     formDataToSend.append('companyName', this.formData.companyName);
  //     formDataToSend.append('selectedLocation', this.formData.selectedLocation);
  //     formDataToSend.append('totalShareholders', this.formData.totalShareholders.length.toString()); // Convert number to string
  //     formDataToSend.append('companyWebsite', this.formData.companyWebsite);
  //     formDataToSend.append('activityType', this.formData.activityType);
  //     if(this.formData.selectedLocation==="United Arab Emirates"){
  //       formDataToSend.append('companyLicensed', this.formData.companyLicensed);

  //     }


  //     // Save Step 2 data to localStorage
  //     // localStorage.setItem('mail3', JSON.stringify(this.formData));

  //     // Append files if necessary

  //     // this.router.navigate(['/BusinessBankShowDetails']);
  //  }
 
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe(); // Unsubscribe from the HTTP request
    }
  }

}