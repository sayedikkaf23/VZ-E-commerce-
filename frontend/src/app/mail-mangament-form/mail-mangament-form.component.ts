import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input'; // Import enums
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser to check the platform
import { UserService } from '../service/user.service';


@Component({
  selector: 'app-mail-mangament-form',
  templateUrl: './mail-mangament-form.component.html',
  styleUrl: './mail-mangament-form.component.css'
})
export class MailMangamentFormComponent {
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
    private userService: UserService,
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
      const storedData = localStorage.getItem('mailform');
      if (storedData) {
        const formData = JSON.parse(storedData);
        this.personalDetailsForm.patchValue(formData);
      }
    }
  }

  onSubmit() {
    if (this.personalDetailsForm.valid) {
      const formData = this.personalDetailsForm.value;


      const payload = {
        email: formData.email,
        mobileNumber: formData.mobileNumber // Add this field if available in the form
      };
  
      // Check if the user already exists
      this.userService.checkUser(payload).subscribe(
        (response: any) => {
          if (response.exists) {
            // Show a toast notification if the user already exists
            this.toastr.error('User with this email already exists', 'Error');
          } else {
            // Save form data to localStorage only in the browser environment
            if (this.isBrowser) {
              localStorage.setItem('mailform', JSON.stringify(formData));
            }
  
            // Check if step2Data exists in localStorage
            // if (this.isBrowser && localStorage.getItem('mailform')) {
            //   // If step2Data exists, navigate to step-2
            //   this.router.navigate(['/step-2']);
            // } else {
            //   // Otherwise, navigate to account-type
            //   this.router.navigate(['/account-type']);
            // }
          }
        },
        error => {
          // Handle error in user check
          this.toastr.error(error.error.message);
          console.error('Error:', error);
        }
      );
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
