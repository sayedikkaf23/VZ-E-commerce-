import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input'; // Import enums
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser to check the platform

@Component({
  selector: 'app-step-1',
  templateUrl: './step-1.component.html',
  styleUrls: ['./step-1.component.css']
})
export class Step1Component implements OnInit {
  personalDetailsForm: FormGroup;
  nationalities: string[] = []; // Initialize as an empty array
  selectedNationality: string = '';
  SearchCountryField = SearchCountryField;  // Assign to use in template
  CountryISO = CountryISO;
  isBrowser: boolean;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService,
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
    this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe((data) => {
      this.nationalities = data.map((country) => country.name.common);
      this.cdRef.detectChanges(); // Manually trigger change detection to update the view
    });

    // Check if we are in the browser before accessing localStorage
    if (this.isBrowser) {
      const storedData = localStorage.getItem('step1Data');
      if (storedData) {
        const formData = JSON.parse(storedData);
        this.personalDetailsForm.patchValue(formData);
      }
    }
  }

  onSubmit() {
    if (this.personalDetailsForm.valid) {
      // Save form data to localStorage only in the browser environment
      if (this.isBrowser) {
        localStorage.setItem('step1Data', JSON.stringify(this.personalDetailsForm.value));
      }

      // Navigate to the next page
      this.router.navigate(['/account-type']);
    } else {
      // Show validation error messages in a single toast
      this.showSingleValidationError(this.personalDetailsForm);
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
}
