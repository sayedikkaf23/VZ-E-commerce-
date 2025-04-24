import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
 
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormDataService } from '../service/form-data.service';
import { UserService } from '../service/user.service';
// import { GetnationalityService } from '../service/getnationality.service';
import { AdminAuthService } from '../service/admin-auth.service';
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
  @ViewChild('dateInput') dateInput!: ElementRef;
 
  formData: any = {
    companylocation: '',
    // jurisdiction: '',
    Bank:'',
    Turnover: '',
    shareholdercount:'',
    type: 'Business Bank',
    CustomerType: 'C',
    tradelicense: '' ,
    Companylicensed: '',
    BusinessActivityRisk: ''
  };
  shareholders: any[] = [{ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '', countryRisk: '' }]; // Initialize with one shareholder
 
  // openDatePicker() {
  //   if (this.dateInput && this.dateInput.nativeElement) {
  //     this.dateInput.nativeElement.focus();  // Ensure the input is focused
  //     this.dateInput.nativeElement.click();  // Programmatically click the input to open the date picker
  //   }
  // }
 
 
  isValidSalary = true;
  files: { passport?: File; salaryStatements?: File[] } = {};
  step1Data: any = {}; // To store Step 1 data
  nationalities: any[] = []; // Initialize as an empty array
  nationalitiesData: string[] = []; // Initialize as an empty array
  businessCategories: any[] = [];
  personalInfo: any;
 
 
  constructor(
    private formDataService: FormDataService,
    private http: HttpClient,
    private userService: UserService,
    // private getnationalityService: GetnationalityService,
    private toastr: ToastrService,
    private router: Router,
    private adminAuthService: AdminAuthService,
    private cdRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Retrieve Step 1 data from the service when Step 2 initializes
    this.step1Data = this.formDataService.getStep1Data();
    // console.log('Step 1 data:', this.step1Data);
  }
 
  ngOnInit(): void {
   
 
    // this.getnationalityService.getCountries().subscribe((data) => {
    //   // Assuming data is an array of country objects
    //   this.nationalities = data.map((country: { name: { common: any; }; }) => country.name.common);
    //   this.cdRef.detectChanges(); // Manually trigger change detection to update the view
    // });
   
 
    // this.getnationalityService.getNationality().subscribe((data) => {
    //   this.nationalities =  data.map((country: { name: { common: any; }; }) => country.name.common); // Get the Label values
    //   this.cdRef.detectChanges(); // Trigger change detection to update the view
    // });
    this.adminAuthService.getCountryRisks().subscribe((data) => {
      this.nationalities = data.sort((a, b) => a.country.localeCompare(b.country));
       
      
      this.cdRef.detectChanges(); // Trigger change detection to update the view
    });
 
    this.userService.getAllBusinessCategories().subscribe(
      (response) => {
        // Log for debugging
        console.log('Categories response:', response);

       
        this.businessCategories = response.data.sort(
          (a: any, b: any) => a.name.localeCompare(b.name)
        );
        this.cdRef.detectChanges();
      },
      (error) => {
        console.error('Error fetching business categories:', error);
      }
    );
 
 
    // Retrieve Step 2 data from localStorage
    const storedStep2Data = localStorage.getItem('mailform2');
    if (storedStep2Data) {
      const parsedData = JSON.parse(storedStep2Data);
     
      // Update formData and shareholders separately
      this.formData = {
        companylocation: parsedData.companylocation,
        jurisdiction: parsedData.jurisdiction,
        Turnover: parsedData.Turnover,
        Bank: parsedData.Bank,

        shareholdercount: parsedData.shareholdercount,
        type: parsedData.type,
        Companylicensed: parsedData.Companylicensed,
        tradelicense: parsedData.tradelicense,
        BusinessActivityRisk: parsedData.BusinessActivityRisk
      };
     
      // Update shareholders if it exists in the parsed data
      if (parsedData.shareholders) {
        this.shareholders = parsedData.shareholders;
      }
      this.updateShareholders();
      // Trigger change detection if necessary
      this.cdRef.detectChanges();
    }
 
   
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedCategoryName = selectElement.value;
  
    const selectedCategory = this.businessCategories.find(
      (cat: any) => cat.name === selectedCategoryName
    );
  
    if (selectedCategory) {
      this.formData.BusinessActivityRisk = selectedCategory.Score; // Store Score in formData
    } else {
      this.formData.BusinessActivityRisk = null; // Optional fallback
    }
  }

  onNationalityChange(event: Event, shareholder: any): void {
    const selectedCountry = (event.target as HTMLSelectElement).value;
    const selectedNationality = this.nationalities.find(n => n.country === selectedCountry);
  
    if (selectedNationality) {
      shareholder.countryRisk = selectedNationality.RiskRating;
    } else {
      shareholder.countryRisk = '';
    }
  }
 
  preventManualInput(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent manual input via keyboard
  }
 
  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker(); // Explicitly trigger the date picker
  }
 
  
  ngAfterViewInit() {
    const Tooltip = (window as any).Tooltip;
    Tooltip.initAll();
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
    // console.log('Add shareholder clicked');
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
 
  updateShareholders() {
    const count = parseInt(this.formData.shareholdercount, 10) || 0;
 
    while (this.shareholders.length < count) {
      this.shareholders.push({
        name: '',
        shareholderPercentage: '',
        dob: '',
        nationalityshareholder: '',
        countryRisk: ''
      });
    }
 
    while (this.shareholders.length > count) {
      this.shareholders.pop();
    }
  }
 
  // updateShareholders() {
  //   const count = parseInt(this.formData.shareholdercount, 10); // Convert count to number
 
  //   // If the selected count is greater than current length, add more shareholder objects
  //   while (this.shareholders.length < count) {
  //     this.shareholders.push({ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '' });
  //   }
 
  //   // If the selected count is smaller, remove extra shareholder objects
  //   while (this.shareholders.length > count) {
  //     this.shareholders.pop();
  //   }
  // }
 
  isFormInvalid(): boolean {
    const shareholderCount = Number(this.formData.shareholdercount);
 
    // Ensure that all fields of each shareholder up to the count are filled
    for (let i = 0; i < shareholderCount; i++) {
      const shareholder = this.shareholders[i];
      if (!shareholder || !shareholder.name || !shareholder.shareholderPercentage || !shareholder.dob || !shareholder.nationalityshareholder) {
        return true;  // Form is invalid if any required field is missing
      }
    }
 
    return false; // Form is valid if all required fields are filled
  }
 
  // Validation and submission logic
  onSubmit() {
    // Check if the form is invalid
    if (this.isFormInvalid()) {
      this.toastr.error('Please fill out all required fields.', 'Form Incomplete');
    } else {
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
        formDataToSend.append('tradelicense', this.formData.tradelicense);
        formDataToSend.append('Companylicensed', this.formData.Companylicensed);
        formDataToSend.append('shareholder', this.shareholders.length.toString()); // Convert number to string
        formDataToSend.append('Turnover', this.formData.Turnover);
        formDataToSend.append('CustomerType', this.formData.CustomerType);
        formDataToSend.append('BusinessActivityRisk',this.formData.BusinessActivityRisk)
 
        this.shareholders.forEach((shareholder, index) => {
          formDataToSend.append(`shareholders[${index}]`, JSON.stringify(shareholder));
        });
 
        const combinedFormData = {
          ...this.formData, // Spread formData properties
          shareholders: this.shareholders // Add the shareholders array
        };
        const mailform = localStorage.getItem('step1Data');
        this.personalInfo = mailform ? JSON.parse(mailform) : {};
        // Save Step 2 data to localStorage
        localStorage.setItem('mailform2', JSON.stringify(combinedFormData));
  console.log(this.step1Data, 'step1Data',combinedFormData)
        // Prepare payload for the API call using Step 1 and Shareholders data
        const payload = {
          customerCountryRisk: this.personalInfo.countryRisk, // This is the customer country from Step 1
          BusisnessActivityRisk: this.formData.BusinessActivityRisk,
          shareholderCountriesRisk: this.shareholders.map(shareholder => shareholder.countryRisk), // Assuming 'nationalityshareholder' property
          totalCusotmerSelected: this.shareholders.length + 2,
        };
 
        // Call the API to get products by category and country risk
        this.userService.getProductsByCategoryAndCountryRisk(payload).subscribe(
          (response) => {
            console.log('API Response:', response);
 
            const appliedRiskData = {
              appliedRisk: response.appliedRisk, // Assuming the response contains 'appliedRisk'
              percentage: response.percentage, // Assuming the response contains 'percentage'
              userRating: response.userRating, // Assuming the response contains 'userRating'
              totalPossibleRating: response.totalPossibleRating // Assuming the response contains 'totalPossibleRating'
            };
 
            // Save the appliedRisk data to localStorage
            localStorage.setItem('appliedRisk', JSON.stringify(appliedRiskData));
            // Handle the response (e.g., store the products in a variable or pass to the next page)
 
            // Navigate to BusinessBankShowDetails after the API call completes
            this.router.navigate(['/BusinessBankShowDetails']);
          },
          (error) => {
            console.error('API Error:', error);
            this.toastr.error('Failed to fetch products.', 'API Error');
          }
        );
      }
    }
  }
 
 
trackByShareholder(index: number, shareholder: any): number {
  return index; // Or return a unique identifier if you have one
}
 
  // Validate form and show a single toast for missing fields
  validateForm(): boolean {
    let isValid = true;
    const missingFields: string[] = [];
 
// console.log(missingFields)
 
    if (!this.formData.companylocation) {
      missingFields.push('Company Location');
      isValid = false;
    }
    // if (!this.formData.jurisdiction) {
    //   missingFields.push('Jurisdiction');
    //   isValid = false;
    // }
    if (this.shareholders.length === 0 || this.shareholders.some(s => !s.name || !s.shareholderPercentage || !s.dob || !s.nationalityshareholder)) {
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
 