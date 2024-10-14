import { Component, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser to check the platform
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { FormDataService } from '../service/form-data.service'; // Adjust the path as necessary
import { UserService } from '../service/user.service'; // Import your UserService
import AOS from 'aos'; // AOS for animations
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

declare var $: any;

@Component({
  selector: 'app-step-2',
  templateUrl: './step-2.component.html',
  styleUrls: ['./step-2.component.css'] // Ensure you have styleUrls instead of styleUrl
})
export class Step2Component implements AfterViewInit {
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
    private toastr: ToastrService, // Inject ToastrService
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID to check if it's a browser
  ) {
    // Retrieve the Step 1 data from the service when Step 2 initializes
    this.step1Data = this.formDataService.getStep1Data();
    console.log('Step 1 data:', this.step1Data);
    // this.toastr.success('Test Toast', 'Success');
  }

  // Handle file input changes
  onFileChange(event: any, fieldName: string) {
    if (fieldName === 'passport') {
      this.files.passport = event.target.files[0];
    } else if (fieldName === 'salaryStatements') {
      // Store all files as an array under the same field name without indices
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

      // Append files
      // Add logic to append file data if necessary

      // Send data to the server using your userService
      this.userService.uploadUserData(formDataToSend).subscribe(
        response => {
          if ('message' in response) {
            this.toastr.success('Data submitted successfully!', 'Success'); // Show success toast
      
            this.formData = {
              resident: '',
              working: '',
              salary: '',
              companyname: '',
              Bank: ''
            };
          }
        },
        error => {
          this.toastr.error(error.error.message); // Show error toast
          console.error(error); // Handle the error
        }
      );
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
