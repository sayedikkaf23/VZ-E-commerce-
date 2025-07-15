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
import { AdminAuthService } from '../service/admin-auth.service';
import { DataStorageService } from '../service/data-storage.service';
// interface Nationality {
//   common: string;
//   country: string;
// }

@Component({
  selector: 'app-mails-management-1',
  templateUrl: './mails-management-1.component.html',
  styleUrl: './mails-management-1.component.css',
})
export class MailsManagement1Component {
  personalDetailsForm: FormGroup;
  nationalities: any[] = [];
  selectedNationality: string = '';
  SearchCountryField = SearchCountryField; // Assign to use in template
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
    // private getnationalityService: GetnationalityService,
    private adminAuthService: AdminAuthService,
    private dataStorageService: DataStorageService, // Inject the service

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

    });
  }

  ngOnInit(): void {
    // Fetch nationalities using REST Countries API
    // this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe((data) => {
    //   this.nationalities = data.map((country) => country.name.common);
    //   this.cdRef.detectChanges(); // Manually trigger change detection to update the view
    // });

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

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
    // if (this.isBrowser) {
    //   const storedData = localStorage.getItem('mailform');
    //   if (storedData) {
    //     const formData = JSON.parse(storedData);
    //     this.personalDetailsForm.patchValue(formData);
    //   }
    // }
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
    this.adminAuthService.getCountryRisks().subscribe((data) => {
      this.nationalities = data.sort((a, b) => a.country.localeCompare(b.country));
       
      
      this.cdRef.detectChanges(); // Trigger change detection to update the view
    });
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
onSubmit() {
  const currentFormValue = this.personalDetailsForm.value;

    let isChanged = true;

  if (this.previousStep1Data) {
    isChanged = Object.keys(currentFormValue).some((key) => {
      const currentVal = (currentFormValue[key] || '').toString().trim();
      const previousVal = (this.previousStep1Data[key] || '').toString().trim();
      return currentVal !== previousVal;
    });
  }

    // If no changes, navigate based on nationality and mailform1
    if (!isChanged) {
      if (this.previousStep1Data.Company) {
        this.router.navigate(['/mails-management-details']);
      } else {
        this.router.navigate(['/mails-management-2']);
      }
      return;
    }
  

  // Proceed with API call since data changed or it's first submission
  if (this.personalDetailsForm.valid) {
    const values = this.personalDetailsForm.value;
    const phoneString = values.mobileNumber?.number || '';
   
    const leadDataRaw = sessionStorage.getItem('leadResponse');
    const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;
      const leadId = leadData?.LeadId;
   
  
    let payload: any;

     
    // Check for email change
    const storedEmail = this.previousStep1Data.Email;
    const currentEmail = values.email;

    if (storedEmail !== currentEmail) {
      // Email changed, create a new lead with an empty leadId
      payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: currentEmail,
        nationality: values.nationality,
        phone: phoneString,
        dob: values.birthday, // yyyy-mm-dd
        service_id: 2,
        leadId: '' // Empty leadId when email is changed
      };

      localStorage.removeItem('mailform1');
      localStorage.removeItem('mailform2');
    } else {
      // Email didn't change, use the same leadId
      payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        nationality: values.nationality,
        phone: phoneString,
        dob: values.birthday, // yyyy-mm-dd
        service_id: 2,
        leadId: leadData?.LeadId || '' // Use existing leadId
      };
    }


    this.isLoading = true;
    this.userService.createLeadOnly(payload).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (this.isBrowser) {
          sessionStorage.setItem('leadResponse', JSON.stringify(res.data));
        }

        // After successful API, navigate based on mailform1 and nationality change
       
        const previousNationality = (this.previousStep1Data?.Nationality || '').trim();
        const currentNationality = (values.nationality || '').trim();

        if (previousNationality !== currentNationality) {
          this.router.navigate(['/mails-management-2']);
        } else if (this.previousStep1Data.Company) {
          this.router.navigate(['/mails-management-details']);
        } else {
          this.router.navigate(['/mails-management-2']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Failed to create lead';
        this.toastr.error(msg, 'Error');
      }
    });
  } else {
    // Handle invalid form
    const mobileControl = this.personalDetailsForm.get('mobileNumber');
    if (mobileControl?.errors?.['validatePhoneNumber']) {
      this.toastr.error(
        'Enter a valid mobile number for the selected country.',
        'Validation Error'
      );
    }
    this.showSingleValidationError(this.personalDetailsForm);
  }
}




  // onSubmit() {
  //   // Check if 'mailform', 'mailform1', and 'mailform2' exist in localStorage
  //   if (this.isBrowser) {
  //     const mailform = localStorage.getItem('mailform');

  //     const mailform1 = localStorage.getItem('mailform1');
  //     const currentFormValue = this.personalDetailsForm.value;

  //     if (mailform && mailform1) {
  //       const previousData = JSON.parse(mailform);
  //       // Update 'mailform' with current form values
  //       const updatedMailForm = {
  //         ...JSON.parse(mailform),
  //         ...this.personalDetailsForm.value,
  //       };

  //       localStorage.setItem('mailform', JSON.stringify(updatedMailForm)); // Save updated 'mailform'

  //       // Compare selected country with previously stored country
  //       const previousCountry = (previousData?.nationality || '').trim();
  //       const currentCountry = (currentFormValue?.nationality || '').trim();

  //       if (previousCountry !== currentCountry) {
  //       // Country has changed 
  //       this.router.navigate(['/mails-management-2']);
  //     } else {
  //       // Country is same 
  //       this.router.navigate(['/mails-management-details']);
  //     }
  //       return; // Exit early to avoid further execution
  //     }
  //   }

  //   if (this.personalDetailsForm.valid) {
  //     const formData = this.personalDetailsForm.value;

  //     if (this.isBrowser) {
  //       if (localStorage.getItem('mailform2')) {
  //         this.router.navigate(['/mails-management-details']);
  //       } else if (localStorage.getItem('mailform')) {
  //         this.router.navigate(['/mails-management-2']);
  //       } else {
  //         this.router.navigate(['/mails-management-2']);
  //       }
  //       localStorage.setItem('mailform', JSON.stringify(formData));
  //     }
  //   } else {
  //     const mobileNumberControl = this.personalDetailsForm.get('mobileNumber');
  //     if (mobileNumberControl?.errors?.['validatePhoneNumber']) {
  //       // Correct key here
  //       this.toastr.error(
  //         'Enter a valid mobile number for the selected country.',
  //         'Validation Error'
  //       );
  //     }

  //     // Use the updated showSingleValidationError method for better feedback
  //     this.showSingleValidationError(this.personalDetailsForm);
  //   }
  // }

  preventManualInput(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent manual input via keyboard
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker(); // Explicitly trigger the date picker
  }
  // Show one toaster for all invalid fields
  showSingleValidationError(formGroup: FormGroup) {
    // Iterate over the form controls to check for invalid fields
    for (const field of Object.keys(formGroup.controls)) {
      const control = formGroup.get(field);
      if (control && control.invalid) {
        if (control.errors?.['required']) {
          this.toastr.error(
            `${this.getFieldName(field)} is required.`,
            'Validation Error'
          );
          return; // Stop the loop after showing the first error
        } else if (control.errors?.['minlength']) {
          const minLength = control.errors['minlength'].requiredLength;
          this.toastr.error(
            `${this.getFieldName(
              field
            )} must be at least ${minLength} characters long.`,
            'Validation Error'
          );
          return; // Stop the loop after showing the first error
        } else if (control.errors?.['email']) {
          this.toastr.error(
            `Please provide a valid ${this.getFieldName(field)}.`,
            'Validation Error'
          );
          return; // Stop the loop after showing the first error
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
        return 'Phone Number';
      case 'birthday':
        return 'Date of Birth';
      default:
        return field;
    }
  }

  get birthdayControl() {
    return this.personalDetailsForm.get('birthday');
  }
}
