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
 previousStep1Data: any = {}; 
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
      // countryRisk: ['', Validators.required]
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
 
    if (this.isBrowser) {
      const leadDataRaw = sessionStorage.getItem('leadResponse');
      const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;
      const leadId = leadData?.LeadId;

      if (leadId) {
        this.isLoading = true;
        this.userService.getStep1(leadId).subscribe({
          next: (formData) => {
            this.personalDetailsForm.patchValue(formData);
             this.previousStep1Data = formData; 
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Failed to load step1 data', err);
            this.isLoading = false;
          }
        });
      }
    }


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
    // Save risk rating in localStorage instead of form
    if (this.isBrowser) {
      sessionStorage.setItem('countryRisk', selectedNationality.RiskRating);
    }
  } else {
    // Remove or reset in localStorage if no risk found
    if (this.isBrowser) {
      sessionStorage.setItem('countryRisk', '');
    }
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
  if (this.personalDetailsForm.valid) {
    const values = this.personalDetailsForm.value;
    const phoneString = values.mobileNumber?.e164Number || '';
    const countryCode = values.mobileNumber?.dialCode || '';
   
    const leadDataRaw = sessionStorage.getItem('leadResponse');
    const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;
 
      const leadId = leadData?.LeadId;
         this.isLoading = true;
            let payload: any;
                // Check for email change
    const storedEmail = this.previousStep1Data.Email;
    const currentEmail = values.email;
              if (storedEmail !== currentEmail) {
                // Email changed → create new lead with empty leadId
                payload = {
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: currentEmail,
                  nationality: values.nationality,
                  phone: phoneString,
                  dob: values.birthday,
                  countryCode: countryCode,
                  service_id: 1,
                  leadId: '' // empty leadId triggers new lead creation
                };
              }
              else {
                // Email not changed → keep existing leadId
                payload = {
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  nationality: values.nationality,
                  phone: phoneString,
                  dob: values.birthday,
                  countryCode: countryCode,
                  service_id: 1,
                  leadId: leadId
                };
              }
                  // Call createLeadOnly API
                  this.userService.createLeadOnly(payload).subscribe({
                    next: (res) => {
                      this.isLoading = false;
              
                      // Save step 1 data to localStorage
                      // if (this.isBrowser) {
                      //   localStorage.setItem('step1Data', JSON.stringify(values));
                      // }
              
                      // Save response data to localStorage (new lead)
                      if (this.isBrowser && res?.data) {
                        sessionStorage.setItem('leadResponse', JSON.stringify(res.data));
                      }
              
                      // Navigate to the next step based on the email change
                      if (!this.previousStep1Data.Company) {
                        this.router.navigate(['/account-type']); // Navigate to Step 2
                      } else {
                        const isBusinessAccount = localStorage.getItem('mailform2') !== null;
                        const isPersonalAccount = localStorage.getItem('step2Data') !== null;
              
                        if (this.isBrowser) {
                        if (storedEmail !== currentEmail) {
                // Remove localStorage items
                localStorage.removeItem('step2Data');
                localStorage.removeItem('mailform2');
              
                // Redirect to account-type page for both cases
                this.router.navigate(['/account-type']);
              } else {
                if (isBusinessAccount) {
                  // Remove localStorage items for business account
                  // localStorage.removeItem('step2Data');
                  // localStorage.removeItem('mailform2');
                
                  // Redirect to business details page
                  this.router.navigate(['/BusinessBankShowDetails']);
                } else if (isPersonalAccount) {
                  // Remove localStorage items for personal account
                  // localStorage.removeItem('step2Data');
                  // localStorage.removeItem('mailform2');
                
                  // Redirect to personal details page
                  this.router.navigate(['/ShowDetails']);
                }
              }
              
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Failed to create lead';
        this.toastr.error(msg, 'Error');
      }
    });

  } else {
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
        } if (control.errors?.['validatePhoneNumber']) {
        this.toastr.error(
          'Enter a valid mobile number for the selected country.',
          'Validation Error'
        );
        return;
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
 