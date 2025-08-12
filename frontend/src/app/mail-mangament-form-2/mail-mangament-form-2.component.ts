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
import { get } from 'node:http';
import { count } from 'node:console';
 
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
    subServiceName:'Business Bank Account Opening',
    serviceName:'Business Bank Account Opening',

    type: 'Business Bank',
    CustomerType: 'C',
    tradelicense: '' ,
    Companylicensed: '',
    BusinessActivityRisk: ''
  };
  shareholders: any[] = [{ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '' }]; // Initialize with one shareholder
 
  // openDatePicker() {
  //   if (this.dateInput && this.dateInput.nativeElement) {
  //     this.dateInput.nativeElement.focus();  // Ensure the input is focused
  //     this.dateInput.nativeElement.click();  // Programmatically click the input to open the date picker
  //   }
  // }
 
 isLoading = false;
  isValidSalary = true;
  files: { passport?: File; salaryStatements?: File[] } = {};
  step1Data: any = {}; // To store Step 1 data
  nationalities: any[] = []; // Initialize as an empty array
  nationalitiesData: string[] = []; // Initialize as an empty array
  businessCategories: any[] = [];
  personalInfo: any;
 maxDate: string | undefined;
  leadResponse: any;
 
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
   
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.maxDate = `${year}-${month}-${day}`;
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
 
 

        const savedLeadId = sessionStorage.getItem('leadId');
    if (savedLeadId) {
      this.formData.leadId = savedLeadId;
    } else {
      // fallback: parse out of full response
      const raw = sessionStorage.getItem('leadResponse');
      if (raw) {
        const leadData = JSON.parse(raw);
        this.formData.leadId = leadData.LeadId ?? '';
      }
    }

    if (this.formData.leadId) {
   this.userService.getStep1(this.formData.leadId).subscribe({
      next: (step1Data) => {
        if (step1Data && Object.keys(step1Data).length > 0) {
          // Safely map fields
          this.formData.companylocation = step1Data.companyLocationUAE || '';
          this.formData.Turnover = step1Data.companyTurnover || '';
          this.formData.Bank = step1Data.bankType || '';
          this.formData.shareholdercount = step1Data.totalShareholders || '';
          this.formData.type = step1Data.type || '';
          this.formData.Companylicensed = step1Data.companyLicensed || '';
          this.formData.tradelicense = step1Data.activityType || '';

          this.personalInfo = step1Data;

           this.userService.getTradeLicenseAndShareholders(this.formData.leadId).subscribe({
            next: (tradeData: any) => {

          if (tradeData.shareholders && Array.isArray(tradeData.shareholders)) {
            this.shareholders = tradeData.shareholders.map((sh: any) => ({
              ...sh,
              dob: sh.dob ? sh.dob.split('T')[0] : ''
            }));
          }

           },
            error: (err:any) => {
              console.error('Failed to load trade license data:', err);
              this.toastr.error('Could not load trade license data.', 'Error');
            }
          });

          this.updateShareholders();
          this.cdRef.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching step1 data:', err);
        this.toastr.error('Failed to load saved data.', 'API Error');
      }
    });
    
}
   
  }
  allowOnlyAlphabets(event: KeyboardEvent): void {
  const charCode = event.key.charCodeAt(0);
  // Allow A-Z, a-z, space, and backspace keys
  const regex = /^[a-zA-Z\s]$/;
  if (!regex.test(event.key)) {
    event.preventDefault();
  }
}
 
  onCategorySearchSelect(selected: string) {
    this.formData.tradelicense = selected;
 
    const selectedCategory = this.businessCategories.find(cat => cat.name === selected);
    if (selectedCategory) {
      this.formData.BusinessActivityRisk = selectedCategory.Score;
    } else {
      this.formData.BusinessActivityRisk = null;
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
 onShareholderInput(event: any, index: number) {
    let val = event.target.value;
 
    // If empty, don't change
    if (val === '') return;
 
    // Clamp value to 100 max
    if (+val > 100) {
      this.shareholders[index].shareholderPercentage = 100;
      event.target.value = 100;
    } else if (+val < 0) {
      this.shareholders[index].shareholderPercentage = 0;
      event.target.value = 0;
    } else {
      this.shareholders[index].shareholderPercentage = +val;
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
  onShareholderNationalitySelect(selectedCountry: string, shareholder: any) {
    shareholder.nationalityshareholder = selectedCountry;
    const found = this.nationalities.find(n => n.country === selectedCountry);
    shareholder.countryRisk = found?.RiskRating ?? '';
  }
 
   addShareholder() {
    this.shareholders.push({ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '' });
  }
 
  deleteShareholder(index: number) {
    this.shareholders.splice(index, 1); // Remove the shareholder at the specified index
  }
 
//   addShareholder() {
//     // console.log('Add shareholder clicked');
//     this.shareholders.push({ name: '', phone: '', dob: '', nationality: '' });
//     this.cdRef.detectChanges(); // Only if necessary
// }
 
// deleteShareholder(index: number) {
//   this.shareholders.splice(index, 1); // Remove the shareholder at the specified index
// }
 
  // Handle file input changes
  onFileChange(event: any, fieldName: string) {
    if (fieldName === 'passport') {
      this.files.passport = event.target.files[0];
    } else if (fieldName === 'salaryStatements') {
      this.files.salaryStatements = Array.from(event.target.files);
    }
  }
 
  updateShareholders() {
    const count = parseInt(this.formData.shareholdercount, 10);
    while (this.shareholders.length < count) {
      this.shareholders.push({ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '' });
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
 

 
 
  onSubmit() {
  // 1️⃣ Validation
  if (this.isFormInvalid()) {
    this.toastr.error('Please fill out all required fields.', 'Form Incomplete');
    return;
  }

 
  // 2️⃣ Build & persist Step 2 FormData (if you actually need it; otherwise you can skip this)
  const formDataToSend = new FormData();
  for (const key in this.step1Data) {
    if (this.step1Data.hasOwnProperty(key)) {
      formDataToSend.append(key, this.step1Data[key]);
    }
  }
  formDataToSend.append('companylocation', this.formData.companylocation);
  formDataToSend.append('tradelicense', this.formData.tradelicense);
  formDataToSend.append('Companylicensed', this.formData.Companylicensed);
  formDataToSend.append('shareholder', this.shareholders.length.toString());
  formDataToSend.append('Turnover', this.formData.Turnover);
  formDataToSend.append('CustomerType', this.formData.CustomerType);
  
      formDataToSend.append('serviceName', this.formData.CustomerType);
      formDataToSend.append('subServiceName', this.formData.subServiceName);
  formDataToSend.append('BusinessActivityRisk', this.formData.BusinessActivityRisk);
  this.shareholders.forEach((sh, i) =>
    formDataToSend.append(`shareholders[${i}]`, JSON.stringify(sh))
  );
 
  const combinedFormData = {
    ...this.formData,
    shareholders: this.shareholders
  };

  console.log(this.step1Data, 'step1Data', combinedFormData);
             let storedRisk = '0';
              
                storedRisk = sessionStorage.getItem('countryRisk') || '0';
              
  // 3️⃣ FIRST API CALL: get products by category & risk
  const riskPayload = {
    customerCountryRisk: parseInt(storedRisk, 10),
    BusisnessActivityRisk: this.formData.BusinessActivityRisk,
    shareholderCountriesRisk: this.shareholders.map(sh => sh.countryRisk),
    totalCusotmerSelected: this.shareholders.length + 2
  };
     
  this.isLoading = true;
 
  this.userService.getProductsByCategoryAndCountryRisk(riskPayload)
    .subscribe({
      next: response => {
        console.log('API Response:', response);
 
        // save appliedRisk
        const appliedRiskData = {
          appliedRisk: response.appliedRisk,
          percentage: response.percentage,
          userRating: response.userRating,
          totalPossibleRating: response.totalPossibleRating
        };
        sessionStorage.setItem('appliedRisk', JSON.stringify(appliedRiskData));
 
        // 4️⃣ AFTER FIRST CALL: build & fire your second payload
        const getValue = (v: any, fb = '') => v == null ? fb : v;
 
        const leadResponseRaw = sessionStorage.getItem('leadResponse');
        this.leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};
const economicDetailId = sessionStorage.getItem('economicDetailId') || "";
   const phoneString = this.personalInfo?.mobileNumber?.e164Number || '';
 
     
        const payload2 = {
          ...this.step1Data,
 
          // resident: getValue(this.formData.resident),
          // working: getValue(this.formData.working),
          companyLicensed: getValue(this.formData.Companylicensed),
          // salary: getValue(this.formData.salary),
          // companyname: getValue(this.formData.companyname),
          Bank: getValue(this.formData.Bank),
          type: getValue(this.formData.type),
          // CustomerType: getValue(this.formData.CustomerType),
 
          companyLocationUAE: getValue(this.formData.companylocation),
          // employmentType: getValue(this.formData.working),
          // companyName: getValue(this.formData.companyname),
          bankType: getValue(this.formData.Bank),
 
          leadId: getValue(this.leadResponse.LeadId),
          accountId: getValue(this.leadResponse.AccountId),
          economicDetailId:economicDetailId,
          serviceName: 'Business Bank Account Opening',
          subServiceName: 'Bank Account Opening',
 
          firstName: this.personalInfo.FirstName,
          lastName: this.personalInfo.LastName,
          email: this.personalInfo.Email,
          nationality: this.personalInfo.Nationality,
          // phone: this.personalInfo.mobileNumber?.number,
          countryCode: this.personalInfo.countryCode || '',
          phone:this.personalInfo.Phone,
          dob: this.personalInfo.dob,
 
          // companyLicensed: getValue(this.formData.companyLicensed),
          activityType: getValue(this.formData.tradelicense),
          totalShareholders: getValue(this.formData.shareholdercount),
          companyTurnover: getValue(this.formData.Turnover),
          companyLocation: getValue(this.formData.companyLocation),
          // companyWebsite: getValue(this.formData.companyWebsite),
          // tradeLicenseNo: getValue(this.formData.tradeLicenseNo),
          // shareholderfilesnumber: getValue(this.formData.shareholderfilesnumber),
          // tradeLicenseFile: getValue(this.formData.tradeLicenseFile),
          // shareholdersfiles: getValue(this.formData.shareholdersfiles),
        //  totalShareholders:getValue(this.formData.shareholdercount),
         shareholders: Array.isArray(this.shareholders) && this.shareholders.length
    ? this.shareholders.map((shareholder) => ({
        name: shareholder.name,
        shareholderPercentage: shareholder.shareholderPercentage,
        dob: shareholder.dob,
        nationalityshareholder: shareholder.nationalityshareholder,
        files: shareholder.files || [], // Ensure files are an empty array if not provided
      }))
    : []
        };
 
        // persist step2 JSON
      
 
        // call insertEconomicDetails
        this.adminAuthService.insertEconomicDetails(payload2)
          .subscribe({
            next: res2 => {
              
                    const economicDetailId = res2.data ? res2.data.economicDetailId : "";
      sessionStorage.setItem('economicDetailId', economicDetailId);
 this.isLoading = false;
                        this.router.navigate(['/BusinessBankShowDetails']);
 
            },
            error: err2 => {
              console.error('Save failed', err2);
              this.toastr.error('Could not save details. Try again.', 'Error');
            }
          });
      },
      error: err => {
        console.error('API Error:', err);
        this.toastr.error('Failed to fetch products.', 'API Error');
      }
    });
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
     if (this.formData.companylocation === 'Yes' && !this.formData.Companylicensed) {
    missingFields.push('Company Licensed');
    isValid = false;
  }
 
  if (!this.formData.tradelicense) {
    missingFields.push('Trade License Activity');
    isValid = false;
  }
 
  if (!this.formData.shareholdercount) {
    missingFields.push('Shareholder Count');
    isValid = false;
  }
 
  if (!this.formData.Turnover) {
    missingFields.push('Turnover');
    isValid = false;
  }
 
  if (!this.formData.Bank) {
    missingFields.push('Bank Application Type');
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