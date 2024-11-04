import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input'; // Import enums
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser to check the platform
import { UserService } from '../service/user.service';
import { GetnationalityService } from '../service/getnationality.service';
import { DataStorageService } from '../service/data-storage.service';

@Component({
  selector: 'app-virtual-receptionist',
  templateUrl: './virtual-receptionist.component.html',
  styleUrl: './virtual-receptionist.component.css'
})
export class VirtualReceptionistComponent {
  personalDetailsForm: FormGroup;
  nationalities: string[] = []; // Initialize as an empty array
  selectedNationality: string = '';
  SearchCountryField = SearchCountryField;  // Assign to use in template
  CountryISO = CountryISO;
  isBrowser: boolean;
  isLoading = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService,
    private userService: UserService,
    private getnationalityService: GetnationalityService,
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
    });
  }

  ngOnInit(): void {
    // Fetch nationalities using REST Countries API
    // this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe((data) => {
    //   this.nationalities = data.map((country) => country.name.common);
    //   this.cdRef.detectChanges(); // Manually trigger change detection to update the view
    // });
    this.getnationalityService.getNationality().subscribe((data) => {
      this.nationalities =  data.map((country: { name: { common: any; }; }) => country.name.common); // Get the Label values
      this.cdRef.detectChanges(); // Trigger change detection to update the view
    });
    // Check if we are in the browser before accessing localStorage
    if (this.isBrowser) {
      const storedData = localStorage.getItem('virtualdata');
      if (storedData) {
        const formData = JSON.parse(storedData);
        this.personalDetailsForm.patchValue(formData);
      }
    }
  }

  onSubmit() {
    if (this.personalDetailsForm.valid) {
      const formData = this.personalDetailsForm.value;
  

      this.isLoading = true;
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        nationality: formData.nationality,
        phone: formData.mobileNumber, // Ensure to map this correctly
        dob: formData.birthday,
        service:"virtual_receptionist"
      };

      this.userService.callSalesforceEndpoint(payload).subscribe(
        (response: any) => {
          this.isLoading = false;

          // Handle the successful response from Salesforce
          this.toastr.success('Details sent successfully to Salesforce', 'Success');
          console.log('Salesforce Response:', response);
          this.dataStorageService.setSalesforceResponse(response);

          // Save form data to localStorage only in the browser environment
          if (this.isBrowser) {
            localStorage.setItem('virtualdata', JSON.stringify(formData));
          }
      
          // Check if step2Data exists in localStorage
          if (this.isBrowser) {
            if (localStorage.getItem('virtualdata2')) {
              // Navigate to MailMangamentShowDetails if mailform2 data exists
              this.router.navigate(['/virtual-receptionist-details']);
            } else if (localStorage.getItem('step2Data')) {
              // Navigate to step-2 if step2Data exists
              this.router.navigate(['/virtual-receptionist-1']);
            } else {
              // Otherwise, navigate to account-type
              this.router.navigate(['/virtual-receptionist-1']);
            }
          }
        },
        error => {
          this.isLoading = false;

          // Handle error from the Salesforce API call
          this.toastr.error('Failed to send details to Salesforce', 'Error');
          console.error('Salesforce API Error:', error);
        }
      );



      // Save form data to localStorage only in the browser environment
    
    } else {
      // Check specifically if mobileNumber is invalid and show toaster for it
      if (this.personalDetailsForm.get('mobileNumber')?.invalid) {
        this.toastr.error('Please provide a valid mobile number.', 'Validation Error');
      } else {
        // Show a general validation error if other fields are missing
        this.showSingleValidationError(this.personalDetailsForm);
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

