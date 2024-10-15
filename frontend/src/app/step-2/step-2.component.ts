import { Component, Inject, PLATFORM_ID, AfterViewInit, OnInit } from '@angular/core';
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
  selector: 'app-step-2',
  templateUrl: './step-2.component.html',
  styleUrls: ['./step-2.component.css']
})
export class Step2Component implements AfterViewInit, OnInit {
  formData: any = {
    resident: '',
    working: '',
    salary: '',
    companyname: '',
    Bank: '',
  };

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
    const storedStep2Data = localStorage.getItem('step2Data');
    if (storedStep2Data) {
      this.formData = JSON.parse(storedStep2Data);
      this.cdRef.detectChanges();
      console.log(  this.formData.working)
    }
  }

  // Handle file input changes
  onFileChange(event: any, fieldName: string) {
    if (fieldName === 'passport') {
      this.files.passport = event.target.files[0];
    } else if (fieldName === 'salaryStatements') {
      this.files.salaryStatements = Array.from(event.target.files);
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
      formDataToSend.append('resident', this.formData.resident);
      formDataToSend.append('working', this.formData.working);
      formDataToSend.append('salary', this.formData.salary);
      formDataToSend.append('companyname', this.formData.companyname);
      formDataToSend.append('Bank', this.formData.Bank);

      // Save Step 2 data to localStorage
      localStorage.setItem('step2Data', JSON.stringify(this.formData));

      // Append files
      // Add logic to append file data if necessary
      this.router.navigate(['/ShowDetails']);
    }
  }

  // Validate form and show toasts for missing fields
  validateForm(): boolean {
    let isValid = true;

    if (!this.formData.resident) {
      this.toastr.error('Resident status is required', 'Validation Error');
      isValid = false;
    }

    if (!this.formData.working) {
      this.toastr.error('Working status is required', 'Validation Error');
      isValid = false;
    }

    if (this.formData.working === 'Salaried' && !this.formData.salary) {
      this.toastr.error('Salary is required for Salaried individuals', 'Validation Error');
      isValid = false;
    }

    if (this.formData.working === 'Self Employed' && !this.formData.companyname) {
      this.toastr.error('Company name is required for Self Employed individuals', 'Validation Error');
      isValid = false;
    }

    if (!this.formData.Bank) {
      this.toastr.error('Bank information is required', 'Validation Error');
      isValid = false;
    }

    return isValid;
  }
}
