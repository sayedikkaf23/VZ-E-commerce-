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
  maxDate: string | undefined;

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
    
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.maxDate = `${year}-${month}-${day}`;
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

  openDatePicker() {
    const dateInput = document.getElementById('birthday') as HTMLInputElement;
    dateInput.showPicker(); // Only works if supported by the browser
}
onSubmit() {
  if (this.personalDetailsForm.valid) {
    const formData = this.personalDetailsForm.value;

    if (this.isBrowser) {
      if (localStorage.getItem('virtualdata2')) {
        this.router.navigate(['/virtual-receptionist-details']);
      } else if (localStorage.getItem('step2Data')) {
        this.router.navigate(['/virtual-receptionist-1']);
      } else {
        this.router.navigate(['/virtual-receptionist-1']);
      }
      localStorage.setItem('virtualdata', JSON.stringify(formData));
    }
  } else {
    // Use the updated `showSingleValidationError` method
    this.showSingleValidationError(this.personalDetailsForm);
  }
}

  

  // Show one toaster for all invalid fields
  showSingleValidationError(formGroup: FormGroup) {
    let hasError = false;
  
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control && control.invalid) {
        hasError = true; // Ensure at least one error is identified
        if (control.errors?.['required']) {
          this.toastr.error(`${this.getFieldName(field)} is required.`, 'Validation Error');
        } else if (control.errors?.['minlength']) {
          const minLength = control.errors['minlength'].requiredLength;
          this.toastr.error(`${this.getFieldName(field)} must be at least ${minLength} characters long.`, 'Validation Error');
        } else if (control.errors?.['email']) {
          this.toastr.error(`Please provide a valid ${this.getFieldName(field)}.`, 'Validation Error');
        }
      }
    });
  
    // Fallback message if no specific error is detected
    if (!hasError) {
      this.toastr.error('Please fill out the form correctly.', 'Validation Error');
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

