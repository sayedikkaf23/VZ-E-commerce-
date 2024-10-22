import {  Inject, PLATFORM_ID, AfterViewInit, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormDataService } from '../service/form-data.service';
import { UserService } from '../service/user.service';
import AOS from 'aos';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-mail-mangament-form-2',
  templateUrl: './mail-mangament-form-2.component.html',
  styleUrls: ['./mail-mangament-form-2.component.css'], // Corrected from styleUrl to styleUrls
  changeDetection: ChangeDetectionStrategy.OnPush, // Use OnPush strategy

})
export class MailMangamentForm2Component implements OnInit, AfterViewInit {
  formData: any = {
    companylocation: '',
    jurisdiction: '',
    Turnover: '',
    shareholdercount:'',
    type: 'Business Bank',
  };
  shareholders: any[] = [{ name: '', phone: '', dob: '', nationality: '' }]; // Initialize with one shareholder

  isValidSalary = true;
  files: { passport?: File; salaryStatements?: File[] } = {};
  step1Data: any = {}; // To store Step 1 data

  constructor(
    private formDataService: FormDataService,
    private http: HttpClient,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Retrieve Step 1 data from the service when Step 2 initializes
    this.step1Data = this.formDataService.getStep1Data();
    console.log('Step 1 data:', this.step1Data);
  }

  ngOnInit(): void {
    // Retrieve Step 2 data from localStorage
    const storedStep2Data = localStorage.getItem('mailform2');
    if (storedStep2Data) {
      this.formData = JSON.parse(storedStep2Data);
      this.cdRef.detectChanges();
    }
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
  addShareholder() {
    console.log('Add shareholder clicked');
    this.shareholders.push({ name: '', phone: '', dob: '', nationality: '' });
    this.cdRef.detectChanges(); // Only if necessary
}

deleteShareholder(index: number) {
  this.shareholders.splice(index, 1); // Remove the shareholder at the specified index
}

  // Handle file input changes
  onFileChange(event: any, fieldName: string) {
    if (fieldName === 'passport') {
      this.files.passport = event.target.files[0];
    } else if (fieldName === 'salaryStatements') {
      this.files.salaryStatements = Array.from(event.target.files);
    }
  }


  // Validation and submission logic
  onSubmit() {
    if (this.validateForm()) {
        const formDataToSend = new FormData();

        // Append Step 1 data
        for (const key in this.step1Data) {
            if (this.step1Data.hasOwnProperty(key)) {
                formDataToSend.append(key, this.step1Data[key]);
            }
        }

        // Append Step 2 data
        formDataToSend.append('companylocation', this.formData.companylocation);
        formDataToSend.append('jurisdiction', this.formData.jurisdiction);
        formDataToSend.append('shareholder', this.shareholders.length.toString()); // Convert number to string
        formDataToSend.append('Turnover', this.formData.Turnover);

        // Save Step 2 data to localStorage
        localStorage.setItem('mailform2', JSON.stringify(this.formData));

        // Append files if necessary

        this.router.navigate(['/BusinessBankShowDetails']);
    }
}

trackByShareholder(index: number, shareholder: any): number {
  return index; // Or return a unique identifier if you have one
}

  // Validate form and show a single toast for missing fields
  validateForm(): boolean {
    let isValid = true;
    const missingFields: string[] = [];

    if (!this.formData.companylocation) {
      missingFields.push('Company Location');
      isValid = false;
    }
    if (!this.formData.jurisdiction) {
      missingFields.push('Jurisdiction');
      isValid = false;
    }
    if (this.shareholders.length === 0 || this.shareholders.some(s => !s.name || !s.phone || !s.dob || !s.nationality)) {
      missingFields.push('Shareholder details');
      isValid = false;
    }
    if (!this.formData.Turnover) {
      missingFields.push('Turnover');
      isValid = false;
    }

    // Show a single toast for all missing fields if any
    if (missingFields.length > 0) {
      const message = `All fields are required`;
      this.toastr.error(message);
    }

    return isValid;
  }
}
