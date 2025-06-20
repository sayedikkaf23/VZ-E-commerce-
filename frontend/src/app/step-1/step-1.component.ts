import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input'; // Import enums
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser to check the platform
import { UserService } from '../service/user.service';
// import { GetnationalityService } from '../service/getnationality.service';
import { DataStorageService } from '../service/data-storage.service';
import { AdminAuthService } from '../service/admin-auth.service';

//  interface Nationality {
//   common: string;
//   country: string;
// }

@Component({
  selector: 'app-step-1',
  templateUrl: './step-1.component.html',
  styleUrls: ['./step-1.component.css']
})
export class Step1Component implements OnInit {
  personalDetailsForm: FormGroup;
  nationalities: any[] = [];
  selectedNationality: string = '';
  SearchCountryField = SearchCountryField;  // Assign to use in template
  CountryISO = CountryISO;  
  isBrowser: boolean;
  isLoading = false;
  maxDate: string | undefined;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService,
    private userService: UserService,
    private adminAuthService: AdminAuthService,

    // private getnationalityService: GetnationalityService,
    private dataStorageService: DataStorageService ,// Inject the service

    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID to detect platform
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Check if the platform is a browser

    this.personalDetailsForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nationality: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      birthday: ['', Validators.required],
      countryRisk: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Fetch nationalities using REST Countries API
    // this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe((data) => {
    //   this.nationalities = data.map((country) => country.name.common);
    //   this.cdRef.detectChanges(); // Manually trigger change detection to update the view
    // });


       this.adminAuthService.getCountryRisks().subscribe((data) => {
      this.nationalities = data.sort((a, b) => a.country.localeCompare(b.country));
       
      
      this.cdRef.detectChanges(); // Trigger change detection to update the view
       
    });


    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.maxDate = `${year}-${month}-${day}`;

   
  // Automatically convert email to lowercase
  this.personalDetailsForm.get('email')?.valueChanges.subscribe(value => {
    const lowercaseEmail = value?.toLowerCase();
    if (value !== lowercaseEmail) {
      this.personalDetailsForm.get('email')?.setValue(lowercaseEmail, { emitEvent: false });
    }
  });
    
    
    // this.getnationalityService.getCountries().subscribe((data) => {
    //   // Assuming data is an array of country objects
    //   this.nationalities = data.map((country: { name: { common: any; }; }) => country.name.common);
    //   this.cdRef.detectChanges(); // Manually trigger change detection to update the view
    // });

    // Check if we are in the browser before accessing localStorage
    if (this.isBrowser) {
      const storedData = localStorage.getItem('step1Data');
    
      if (storedData) {
        const formData = JSON.parse(storedData);
        this.personalDetailsForm.patchValue(formData);
      }
    }
  console.log('ngOnInit called');
 if (typeof window !== 'undefined') {
 
    const isMobile = window.innerWidth <= 768;  // adjust breakpoint as needed
    if (!isMobile) {
      console.log('Not mobile screen, no reload');
      return;
    }

    let reloadCount = Number(sessionStorage.getItem('pageReloadCount')) || 0;

    console.log('Reload count:', reloadCount);
 this.isLoading = true;

    if (reloadCount <= 1) {
      reloadCount++;
      sessionStorage.setItem('pageReloadCount', reloadCount.toString());
      console.log(`Reloading page now on mobile. Reload count is ${reloadCount}`);
      window.location.reload();
       this.isLoading = false;
      return;
    } else {
      console.log('Page reloaded twice already on mobile. No more reloads.');
      this.isLoading = false;
      sessionStorage.removeItem('pageReloadCount'); // optional reset
    }
  }
 
  }


  onNationalitySelect(selectedCountry: string): void {
    this.personalDetailsForm.patchValue({
      nationality: selectedCountry
    });
  
    const selectedNationality = this.nationalities.find(n => n.country === selectedCountry);
  
    if (selectedNationality) {
      this.personalDetailsForm.patchValue({
        countryRisk: selectedNationality.RiskRating
      });
    } else {
      this.personalDetailsForm.patchValue({
        countryRisk: ''
      });
    }
  }

  get birthdayControl() {
    return this.personalDetailsForm.get('birthday');
  }

  preventManualInput(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent manual input via keyboard
  }
  
  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker(); // Explicitly trigger the date picker
  }
onSubmit() {
  // 1) If both step1Data and step2Data exist, just update + navigate (no API call)
  if (this.isBrowser) {
    const step1Data = localStorage.getItem('step1Data');
    const step2Data = localStorage.getItem('step2Data');
    const mailform2 = localStorage.getItem('mailform2');
    const currentFormValue = this.personalDetailsForm.value;
     const leadDataRaw = localStorage.getItem('leadResponse');
    const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;

    if (step1Data && step2Data) {
      // merge current values into step1Data
      const updatedStep1Data = {
        ...JSON.parse(step1Data),
        ...currentFormValue,
      };
      localStorage.setItem('step1Data', JSON.stringify(updatedStep1Data));
      this.router.navigate(['/ShowDetails']);
      return; // exit early
    }

    if (step1Data && mailform2) {
      const previousData = JSON.parse(step1Data);
      const mailform2Data = JSON.parse(mailform2);

      // merge current values into step1Data
      const updatedStep1Data = {
        ...previousData,
        ...currentFormValue,
      };
      localStorage.setItem('step1Data', JSON.stringify(updatedStep1Data));

      // compare old vs new nationality
      const previousCountry = (previousData?.nationality || '').trim();
      const currentCountry = (currentFormValue?.nationality || '').trim();
      if (previousCountry !== currentCountry) {
        // country changed → clear tradelicense from mailform2
        mailform2Data.tradelicense = '';
        localStorage.setItem('mailform2', JSON.stringify(mailform2Data));
        this.router.navigate(['/BusinessBankform']);
      } else {
        this.router.navigate(['/BusinessBankShowDetails']);
      }
      return; // exit early
    }
  }

  // 2) If form is valid (and none of the above returned), call createLeadOnly first
  if (this.personalDetailsForm.valid) {
    const values = this.personalDetailsForm.value;
    // grab only the phone string
    const phoneString = values.mobileNumber?.e164Number || '';
const leadDataRaw = localStorage.getItem('leadResponse');
const leadData    = leadDataRaw ? JSON.parse(leadDataRaw) : null;
    // build the payload exactly as Salesforce expects
    const payload = {
      firstName:   values.firstName,
      lastName:    values.lastName,
      email:       values.email,
      nationality: values.nationality,
      phone:       phoneString,
      dob:         values.birthday, // yyyy-mm-dd
      service_id: 1,
            leadId: leadData?.LeadId || ''

    };

    this.isLoading = true;
    this.userService.createLeadOnly(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        // on success, save step1Data to localStorage
        if (this.isBrowser) {
          localStorage.setItem('step1Data', JSON.stringify(values));
        }
        // this.toastr.success('Lead created successfully!');

  if (this.isBrowser && res?.data) {
    localStorage.setItem('leadResponse', JSON.stringify(res.data));
  }
        // now replicate your original navigation logic
        if (this.isBrowser) {
          if (localStorage.getItem('step2Data')) {
            // if step2Data already exists, go straight to ShowDetails
            this.router.navigate(['/ShowDetails']);
          } else {
            // otherwise, go to account-type
            this.router.navigate(['/account-type']);
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Failed to create lead';
        this.toastr.error(msg, 'Error');
      }
    });
  }
  else {
    // form invalid: show validation toasts
    const mobileNumberControl = this.personalDetailsForm.get('mobileNumber');
    if (mobileNumberControl?.errors?.['validatePhoneNumber']) {
      this.toastr.error(
        'Enter a valid mobile number for the selected country.',
        'Validation Error'
      );
    }
    this.showFieldValidationErrors(this.personalDetailsForm);
  }
}


// onSubmit() {

//     // Check if step-1 and step-2 data exist in localStorage
//     if (this.isBrowser) {
//       const step1Data = localStorage.getItem('step1Data');
//       const step2Data = localStorage.getItem('step2Data');
//       const mailform2 = localStorage.getItem('mailform2');
//       const currentFormValue = this.personalDetailsForm.value;
//       if (step1Data && step2Data) {
        
//         // Update step-1 data with current form values
//         const updatedStep1Data = {
//           ...JSON.parse(step1Data),
//           ...this.personalDetailsForm.value,
//         };
  
//         localStorage.setItem('step1Data', JSON.stringify(updatedStep1Data)); // Save updated step-1 data
  
//       this.router.navigate(['/ShowDetails']);
//         return; // Exit early to avoid further execution
//       }

//       if (step1Data && mailform2) {
//         const previousData = JSON.parse(step1Data);
//         const mailform2Data = JSON.parse(mailform2);
//         // Update step-1 data with current form values
//         const updatedStep1Data = {
//           ...JSON.parse(step1Data),
//           ...this.personalDetailsForm.value,
//         };
  
//         localStorage.setItem('step1Data', JSON.stringify(updatedStep1Data)); // Save updated step-1 data
  
//          // Compare selected country with previously stored country
//          const previousCountry = (previousData?.nationality || '').trim();
//          const currentCountry = (currentFormValue?.nationality || '').trim();
 
//          if (previousCountry !== currentCountry) {
//           // Country has changed → clear tradelicence
//           mailform2Data.tradelicense = '';

//           // Update mailform2 in localStorage
//           localStorage.setItem('mailform2', JSON.stringify(mailform2Data));
//           this.router.navigate(['/BusinessBankform']);
//        } else {
//          // Country is same 
//          this.router.navigate(['/BusinessBankShowDetails']);
//        }
//         return; // Exit early to avoid further execution
//       }
//     }


//   if (this.personalDetailsForm.valid) {
//     const formData = this.personalDetailsForm.value;

 
//     // Save form data to localStorage only in the browser environment
//     if (this.isBrowser) {
//       localStorage.setItem('step1Data', JSON.stringify(formData));
//     }

//     this.router.navigate(['/account-type']);
//   } else {


//     const mobileNumberControl = this.personalDetailsForm.get('mobileNumber');
//     if (mobileNumberControl?.errors?.['validatePhoneNumber']) { // Correct key here
//       this.toastr.error('Enter a valid mobile number for the selected country.', 'Validation Error');
//     }

//     // Display validation errors for invalid fields
//     this.showFieldValidationErrors(this.personalDetailsForm);
//   }
// }

  // Show one toaster for all invalid fields
  showFieldValidationErrors(formGroup: FormGroup) {
    for (const field of Object.keys(formGroup.controls)) {
      const control = formGroup.get(field);
      if (control && control.invalid) {
        if (control.errors?.['required']) {
          this.toastr.error(`${this.getFieldName(field)} is required.`, 'Validation Error');
          return; // Show error and return to stop further toasts from appearing
        } else if (control.errors?.['minlength']) {
          const minLength = control.errors['minlength'].requiredLength;
          this.toastr.error(`${this.getFieldName(field)} must be at least ${minLength} characters long.`, 'Validation Error');
          return; // Show error and return
        } else if (control.errors?.['email']) {
          this.toastr.error(`Please provide a valid ${this.getFieldName(field)}.`, 'Validation Error');
          return; // Show error and return
        }
      }
    }
  }
  
  
  

  getFieldName(field: string): string {
    switch (field) {
      case 'firstName':
        return 'First Name';
      case 'lastName':
        return 'Last Name';
      case 'email':
        return 'Email';
      case 'nationality':
        return 'Nationality';
      case 'mobileNumber':
        return 'Mobile Number';
      case 'birthday':
        return 'Date of Birth';
      default:
        return field;
    }
  }
  
  
}
