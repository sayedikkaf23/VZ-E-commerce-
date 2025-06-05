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
      countryRisk: ['', Validators.required]
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
    if (this.isBrowser) {
      const storedData = localStorage.getItem('mailform');
      if (storedData) {
        const formData = JSON.parse(storedData);
        this.personalDetailsForm.patchValue(formData);
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
    this.personalDetailsForm.patchValue({
      countryRisk: selectedNationality.RiskRating
    });
  } else {
    this.personalDetailsForm.patchValue({
      countryRisk: ''
    });
  }
}
onSubmit() {
  // if both mailform and mailform1 are in localStorage, just update and navigate (no API call here)
  if (this.isBrowser) {
    const mailform = localStorage.getItem('mailform');
    const mailform1 = localStorage.getItem('mailform1');
    const currentFormValue = this.personalDetailsForm.value;

    if (mailform && mailform1) {
      const previousData = JSON.parse(mailform);
      // merge new values into mailform
      const updatedMailForm = {
        ...previousData,
        ...currentFormValue
      };
      localStorage.setItem('mailform', JSON.stringify(updatedMailForm));

      // compare countries
      const previousCountry = (previousData?.nationality || '').trim();
      const currentCountry = (currentFormValue?.nationality || '').trim();

      if (previousCountry !== currentCountry) {
        this.router.navigate(['/mails-management-2']);
      } else {
        this.router.navigate(['/mails-management-details']);
      }
      return; // exit early (no API call in this branch)
    }
  }

  // at this point, we either have no mailform in storage or form is “fresh”
  if (this.personalDetailsForm.valid) {
    const values = this.personalDetailsForm.value;
    // extract just the phone string (API wants a simple string, not the full intl-tel object)
    const phoneString = values.mobileNumber?.e164Number || '';

    // build payload exactly to match your Salesforce endpoint:
    const payload = {
      firstName:   values.firstName,
      lastName:    values.lastName,
      email:       values.email,
      nationality: values.nationality,
      phone:       phoneString,
      dob:         values.birthday  // assuming yyyy-mm-dd is fine
    };

    this.isLoading = true;
    this.userService.createLeadOnly(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Save the formData into localStorage (so next step can read it)
        if (this.isBrowser) {
          localStorage.setItem('mailform', JSON.stringify(values));  
        localStorage.setItem('leadResponse', JSON.stringify(res.data));
        }

        // this.toastr.success('Lead created successfully!');

        // now replicate your original routing logic:
        if (this.isBrowser) {
          if (localStorage.getItem('mailform2')) {
            this.router.navigate(['/mails-management-details']);
          } else if (localStorage.getItem('mailform')) {
            this.router.navigate(['/mails-management-2']);
          } else {
            this.router.navigate(['/mails-management-2']);
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        // show whatever Salesforce returned, or a generic message
        const msg = err.error?.message || 'Failed to create lead';
        this.toastr.error(msg, 'Error');
      }
    });
  } else {
    // form is invalid: show validation toast(s)
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
