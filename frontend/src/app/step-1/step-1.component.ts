import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

import { HttpClient } from '@angular/common/http'; // Import HttpClientModule and HttpClient
import { ChangeDetectorRef } from '@angular/core';
import AOS from 'aos';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService for toast notifications

declare var $: any;

import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';


import { FormDataService } from '../service/form-data.service'; // Import the shared service


@Component({
  selector: 'app-step-1',
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.css'
})
export class Step1Component {
  personalDetailsForm: FormGroup;
  nationalities: string[] = []; // Initialize as an empty array
  selectedNationality: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private formDataService: FormDataService, // Inject the service
    private http: HttpClient ,// Inject HttpClient here
    private cdRef: ChangeDetectorRef, // Inject ChangeDetectorRef to manually trigger change detection
    private toastr: ToastrService, // Inject ToastrService for toast notifications
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID
  ) {
    this.personalDetailsForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nationality: ['', Validators.required],
      birthday: { type: Date, required: true },
    });
  }

  ngOnInit(): void {
    // Fetch nationalities using REST Countries API
    this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe((data) => {
      // Map the API response to get country names
      this.nationalities = data.map((country) => country.name.common);
      // console.log(this.nationalities); // Verify that the nationalities array is populated
      this.cdRef.detectChanges(); // Manually trigger change detection to update the view
    });
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
  

  onSubmit() {
    if (this.personalDetailsForm.valid) {
      // Save the form data in the shared service
      this.formDataService.setStep1Data(this.personalDetailsForm.value);
      console.log(this.personalDetailsForm.value);
      this.router.navigate(['/account-type']);
    } else {
      // Show validation error messages using Toastr
      this.validateFormFields(this.personalDetailsForm);
    }
  }

  validateFormFields(formGroup: FormGroup) {
    // Loop through each control to check its validity
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control && control.invalid) {
        if (control.errors?.['required']) {
          this.toastr.error(`${this.getFieldName(field)} is required`, 'Validation Error');
        }
        if (control.errors?.['minlength']) {
          this.toastr.error(
            `${this.getFieldName(field)} must be at least ${control.errors['minlength'].requiredLength} characters long`,
            'Validation Error'
          );
        }
        if (control.errors?.['email']) {
          this.toastr.error('Please enter a valid email address', 'Validation Error');
        }
      }
    });
  }

  getFieldName(field: string): string {
    // Return a user-friendly field name
    switch (field) {
      case 'firstName':
        return 'First Name';
      case 'lastName':
        return 'Last Name';
      case 'email':
        return 'Email';
      case 'nationality':
        return 'Nationality';
      case 'birthday':
        return 'Birthday';
      default:
        return field;
    }
  }
}
