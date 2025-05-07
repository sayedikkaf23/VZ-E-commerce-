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


    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.maxDate = `${year}-${month}-${day}`;

   
  
    
    
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

    // Check if step-1 and step-2 data exist in localStorage
    if (this.isBrowser) {
      const step1Data = localStorage.getItem('step1Data');
      const step2Data = localStorage.getItem('step2Data');
      const mailform2 = localStorage.getItem('mailform2');
      const currentFormValue = this.personalDetailsForm.value;
      if (step1Data && step2Data) {
        
        // Update step-1 data with current form values
        const updatedStep1Data = {
          ...JSON.parse(step1Data),
          ...this.personalDetailsForm.value,
        };
  
        localStorage.setItem('step1Data', JSON.stringify(updatedStep1Data)); // Save updated step-1 data
  
      this.router.navigate(['/ShowDetails']);
        return; // Exit early to avoid further execution
      }

      if (step1Data && mailform2) {
        const previousData = JSON.parse(step1Data);
        const mailform2Data = JSON.parse(mailform2);
        // Update step-1 data with current form values
        const updatedStep1Data = {
          ...JSON.parse(step1Data),
          ...this.personalDetailsForm.value,
        };
  
        localStorage.setItem('step1Data', JSON.stringify(updatedStep1Data)); // Save updated step-1 data
  
         // Compare selected country with previously stored country
         const previousCountry = (previousData?.nationality || '').trim();
         const currentCountry = (currentFormValue?.nationality || '').trim();
 
         if (previousCountry !== currentCountry) {
          // Country has changed → clear tradelicence
          mailform2Data.tradelicense = '';

          // Update mailform2 in localStorage
          localStorage.setItem('mailform2', JSON.stringify(mailform2Data));
          this.router.navigate(['/BusinessBankform']);
       } else {
         // Country is same 
         this.router.navigate(['/BusinessBankShowDetails']);
       }
        return; // Exit early to avoid further execution
      }
    }


  if (this.personalDetailsForm.valid) {
    const formData = this.personalDetailsForm.value;

 
    // Save form data to localStorage only in the browser environment
    if (this.isBrowser) {
      localStorage.setItem('step1Data', JSON.stringify(formData));
    }

    this.router.navigate(['/account-type']);
  } else {


    const mobileNumberControl = this.personalDetailsForm.get('mobileNumber');
    if (mobileNumberControl?.errors?.['validatePhoneNumber']) { // Correct key here
      this.toastr.error('Enter a valid mobile number for the selected country.', 'Validation Error');
    }

    // Display validation errors for invalid fields
    this.showFieldValidationErrors(this.personalDetailsForm);
  }
}

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
