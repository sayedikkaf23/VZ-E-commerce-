import {
  Component,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormDataService } from '../service/form-data.service';
import { UserService } from '../service/user.service';
import AOS from 'aos';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common'; // Import DecimalPipe
import { AdminAuthService } from '../service/admin-auth.service';
import { count } from 'console';
declare var $: any;

@Component({
  selector: 'app-step-2',
  templateUrl: './step-2.component.html',
  styleUrls: ['./step-2.component.css'],
  providers: [DecimalPipe],
})
export class Step2Component implements AfterViewInit, OnInit {
  private readonly step2DraftKey = 'step2Draft';
  formData: any = {
    resident: '',
    working: '',
    salary: '',
    companyname: '',
    Bank: '',
    type: 'Personal Bank',
    CustomerType: 'I',
    leadId: '', // ← add this
  };
  isValidSalary = true;
  personalInfo: any;

  files: { passport?: File; salaryStatements?: File[] } = {};
  step1Data: any = {}; // To store Step 1 data
  leadResponse: any;
  isLoading = false;
  previousStep1Data: any = {};
  constructor(
    private formDataService: FormDataService,
    private http: HttpClient,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    private adminAuthService: AdminAuthService,

    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Retrieve Step 1 data from the service when Step 2 initializes
    this.step1Data = this.formDataService.getStep1Data() || {};
    // console.log('Step 1 data:', this.step1Data);
  }

  ngOnInit(): void {
    const step2DraftRaw = sessionStorage.getItem(this.step2DraftKey);
    if (step2DraftRaw) {
      try {
        this.formData = { ...this.formData, ...JSON.parse(step2DraftRaw) };
      } catch {
        sessionStorage.removeItem(this.step2DraftKey);
      }
    }
    // // Retrieve Step 2 data from localStorage
    // const storedStep2Data = localStorage.getItem('step2Data');
    // if (storedStep2Data) {
    //   this.formData = JSON.parse(storedStep2Data);
    //   this.cdRef.detectChanges();

    //   const phoneNumberWithCountryCode =
    //     this.formData?.mobileNumber?.e164Number || '';
    //   console.log(
    //     'Phone number with country code:',
    //     phoneNumberWithCountryCode
    //   );
    //   // console.log(  this.formData.working)
    // }
    // first try your separate leadId key
      // fallback: parse out of full response
      const raw = sessionStorage.getItem('leadResponse');
      if (raw) {
        const leadData = JSON.parse(raw);
        this.formData.leadId = leadData.LeadId ?? '';
      }
    


    if (this.formData.leadId) {
        this.isLoading = true;
        this.userService.getStep1(this.formData.leadId).subscribe({
          next: (res) => {
            if (res && Object.keys(res).length > 0) {
          // safely map API fields → formData fields
          this.formData.resident = res.companyLocationUAE || '';
          this.formData.working = res.employmentType || '';
          this.formData.salary = res.salary || '';
          this.formData.companyname = res.Company || '';
          this.formData.Bank = res.bankType || '';
          this.formData.type = res.type || '';
          this.formData.CustomerType = res.CustomerType || '';
          this.formData.companyLocation = res.companyLocation || '';

           this.previousStep1Data = res;
        }
        this.isLoading = false;
        this.cdRef.detectChanges();
          },
          error: (err) => {
            console.error('Failed to load step1 data', err);
            this.isLoading = false;
          }
        });
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

  onSalaryInput(event: any) {
    // Get the input value and remove any non-digit characters
    let inputValue = event.target.value.replace(/[^0-9]/g, '');

    // Format the number with commas
    if (inputValue) {
      this.formData.salary = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      this.formData.salary = '';
    }

    // Update the input field value directly to avoid any delay
    event.target.value = this.formData.salary;
    sessionStorage.setItem(this.step2DraftKey, JSON.stringify(this.formData));
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
    if (!this.validateForm()) return;

    const getValue = (value: any, fallback = '') =>
      value === null || value === undefined ? fallback : value;

    const leadResponseRaw = sessionStorage.getItem('leadResponse');
    this.leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};

    // const mailform = localStorage.getItem('step1Data');
    // this.personalInfo = mailform ? JSON.parse(mailform) : {};
    const economicDetailId = sessionStorage.getItem('economicDetailId') || '';
    const phoneString = this.personalInfo?.mobileNumber?.e164Number || '';

    const step1 = this.previousStep1Data || {};
    const step1DataSafe = this.step1Data || {};

    const payload = {
      ...step1DataSafe,

      resident: getValue(this.formData.resident),
      working: getValue(this.formData.working),
      salary: getValue(this.formData.salary),
      companyname: getValue(this.formData.companyname),
      Bank: getValue(this.formData.Bank),
      type: getValue(this.formData.type),
      CustomerType: getValue(this.formData.CustomerType),

      companyLocationUAE: getValue(this.formData.resident),
      employmentType: getValue(this.formData.working),
      companyName: getValue(this.formData.companyname),
      bankType: getValue(this.formData.Bank),
      economicDetailId: economicDetailId,

      leadId: getValue(this.leadResponse.LeadId),
      accountId: getValue(this.leadResponse.AccountId),

      serviceName: 'Bank Account Opening',
      subServiceName: 'Personal Bank Account Opening',

      // Optional fields
      firstName: getValue(step1.FirstName, getValue(step1DataSafe.firstName)),
      lastName: getValue(step1.LastName, getValue(step1DataSafe.lastName)),
      email: getValue(step1.Email, getValue(step1DataSafe.email)),
      nationality: getValue(step1.Nationality, getValue(step1DataSafe.nationality)),
      // phone: this.personalInfo.mobileNumber.number,
      phone: getValue(step1.Phone, getValue(step1DataSafe.phone)),
      countryCode: getValue(step1.countryCode, getValue(step1DataSafe.countryCode)),
      dob: getValue(step1.dob, getValue(step1DataSafe.birthday)),
      companyLicensed: getValue(this.formData.companyLicensed),
      activityType: getValue(this.formData.activityType),
      totalShareholders: getValue(this.formData.totalShareholders),
      companyTurnover: getValue(this.formData.companyTurnover),
      companyLocation: getValue(this.formData.companyLocation),
      companyWebsite: getValue(this.formData.companyWebsite),
      // tradeLicenseNo: getValue(this.formData.tradeLicenseNo),
      // shareholderfilesnumber: getValue(this.formData.shareholderfilesnumber),
      // tradeLicenseFile: getValue(this.formData.tradeLicenseFile),
      // shareholdersfiles: getValue(this.formData.shareholdersfiles),

      // Use [] instead of "" for array field
      shareholders: Array.isArray(this.formData.shareholders)
        ? this.formData.shareholders
        : [],
    };
    sessionStorage.setItem(this.step2DraftKey, JSON.stringify(this.formData));
    sessionStorage.setItem('showDetailsFallback', JSON.stringify(payload));
    this.isLoading = true
    this.adminAuthService.insertEconomicDetails(payload).subscribe({
      next: (res: any) => {
        const economicDetailId = res.data ? res.data.economicDetailId : '';
        sessionStorage.setItem('economicDetailId', economicDetailId);
        this.isLoading = false;

        this.router.navigate(['/ShowDetails']);
      },
      error: (err: any) => {
        console.error('Save failed', err);
      },
    });
  }

  // Validate form and show a single toast for missing fields
  validateForm(): boolean {
    let isValid = true;
    const missingFields: string[] = []; // Array to hold missing fields

    if (!this.formData.resident) {
      missingFields.push('Resident status');
      isValid = false;
    }

    if (!this.formData.working) {
      missingFields.push('Working status');
      isValid = false;
    }

    if (this.formData.working === 'Salaried' && !this.formData.salary) {
      missingFields.push('Salary for Salaried individuals');
      isValid = false;
    }

    if (
      this.formData.working === 'Self Employed' &&
      !this.formData.companyname
    ) {
      missingFields.push('Company name for Self Employed individuals');
      isValid = false;
    }

    if (!this.formData.Bank) {
      missingFields.push('Bank information');
      isValid = false;
    }

    // Show a single toast for all missing fields if any
    if (missingFields.length > 0) {
      const message = `All fields are required`;
      this.toastr.error(message);
    }

    return isValid;
  }
  // Function to format salary as the user types
  formatSalary(value: any) {
    const plainNumber = value.replace(/[^\d.-]/g, ''); // Strip out non-numeric characters
    this.formData.salary = this.decimalPipe.transform(plainNumber, '1.2-2'); // Format the value to 2 decimal places
  }
}
