import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
// import { GetnationalityService } from '../service/getnationality.service';
import { AdminAuthService } from '../service/admin-auth.service';
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
  selector: 'app-mails-management-2',
  templateUrl: './mails-management-2.component.html',
  styleUrls: ['./mails-management-2.component.css']
})
export class MailsManagement2Component implements OnInit, AfterViewInit {
  @ViewChild('dateInput') dateInput!: ElementRef;

  formData: any = {
    CompanyName: '',
    CompanyIncorporated: '',
    Website: '',
    tradelicense: '',
    shareholdercount: '',
    Companylicensed: '',
    BusinessActivityRisk: ''
  };

  shareholders: any[] = [{ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '', countryRisk: '' }];

  isValidSalary = true;
  files: { passport?: File; salaryStatements?: File[] } = {};
  step1Data: any = {};
  nationalities: any[] = [];
  nationalitiesData: string[] = [];
  businessCategories: any[] = [];
  personalInfo: any;

  constructor(
    private formDataService: FormDataService,
    private http: HttpClient,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private adminAuthService: AdminAuthService,
    // private getnationalityService: GetnationalityService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.step1Data = this.formDataService.getmailformData();
    // console.log('Step 1 data:', this.step1Data);
  }


  ngOnInit(): void {
    // Load nationality data
    // this.getnationalityService.getCountries().subscribe((data) => {
    //   // Map and trim whitespace, sort case-insensitively
    //   this.nationalities = data
    //     .map((country: { name: { common: string } }) => country.name.common.trim())
    //     .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    //   // Trigger change detection to update the view
    //   this.cdRef.detectChanges();
    // });
    

    // this.getnationalityService.getNationality().subscribe((data) => {
    //   this.nationalitiesData = data.map((country: { name: { common: any; }; }) => country.name.common);
    //   this.cdRef.detectChanges();
    // });

    this.adminAuthService.getCountryRisks().subscribe((data) => {
      this.nationalities = data.sort((a, b) => a.country.localeCompare(b.country));
       
      
      this.cdRef.detectChanges(); // Trigger change detection to update the view
    });

  
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    // Retrieve Step 2 data from localStorage
    const storedStep2Data = localStorage.getItem('mailform1');
    if (storedStep2Data) {
      const parsedData = JSON.parse(storedStep2Data);

      this.formData = { 
        CompanyName: parsedData.CompanyName, 
        CompanyIncorporated: parsedData.CompanyIncorporated, 
        Website: parsedData.Website, 
        tradelicense: parsedData.tradelicense,
        shareholdercount: parsedData.shareholdercount,
        Companylicensed: parsedData.Companylicensed,
        BusinessActivityRisk: parsedData.BusinessActivityRisk
      };
      
      if (parsedData.shareholders) {
        this.shareholders = parsedData.shareholders;
      }

   


      // Ensure correct number of shareholders
      this.updateShareholders();

      this.cdRef.detectChanges();
    }

     
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

  }

  onTradeCategorySelect(selectedCategory: string) {
    this.formData.tradelicense = selectedCategory;
  
    const selected = this.businessCategories.find(c => c.name === selectedCategory);
    this.formData.BusinessActivityRisk = selected?.Score ?? '';
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
  onShareholderNationalitySelect(selectedCountry: string, shareholder: any) {
    shareholder.nationalityshareholder = selectedCountry;
    const found = this.nationalities.find(n => n.country === selectedCountry);
    shareholder.countryRisk = found?.RiskRating ?? '';
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


 
  ngAfterViewInit() {
    const Tooltip = (window as any).Tooltip;
    if (Tooltip && typeof Tooltip.initAll === 'function') {
      Tooltip.initAll();
    }
    if (isPlatformBrowser(this.platformId)) {
      AOS.init();

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

  // openDatePicker() {
  //   if (this.dateInput && this.dateInput.nativeElement) {
  //     this.dateInput.nativeElement.focus();
  //     this.dateInput.nativeElement.click();
  //   }
  // }

  addShareholder() {
    this.shareholders.push({ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '' });
    this.cdRef.detectChanges();
  }

  deleteShareholder(index: number) {
    this.shareholders.splice(index, 1);
  }

  onFileChange(event: any, fieldName: string) {
    if (fieldName === 'passport') {
      this.files.passport = event.target.files[0];
    } else if (fieldName === 'salaryStatements') {
      this.files.salaryStatements = Array.from(event.target.files);
    }
  }

  updateShareholders() {
    const count = parseInt(this.formData.shareholdercount, 10);

    // Add shareholders if needed
    while (this.shareholders.length < count) {
      this.shareholders.push({ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '', countryRisk: '' });
    }

    // Remove extra shareholders if needed
    while (this.shareholders.length > count) {
      this.shareholders.pop();
    }
  }

  isFormInvalid(): boolean {
    const shareholderCount = Number(this.formData.shareholdercount);

    for (let i = 0; i < shareholderCount; i++) {
      const shareholder = this.shareholders[i];
      if (!shareholder || !shareholder.name || !shareholder.shareholderPercentage || !shareholder.dob || !shareholder.nationalityshareholder) {
        return true;
      }
    }
    return false;
  }

  onSubmit() {
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
        formDataToSend.append('CompanyName', this.formData.CompanyName);
        formDataToSend.append('CompanyIncorporated', this.formData.CompanyIncorporated);
        formDataToSend.append('shareholdercount', this.formData.shareholdercount);
        formDataToSend.append('Website', this.formData.Website);
        formDataToSend.append('tradelicense', this.formData.tradelicense);
        formDataToSend.append('Companylicensed', this.formData.Companylicensed);
        formDataToSend.append('BusinessActivityRisk', this.formData.BusinessActivityRisk);

        this.shareholders.forEach((shareholder, index) => {
          formDataToSend.append(`shareholders[${index}]`, JSON.stringify(shareholder));
        });

        const combinedFormData = {
          ...this.formData,
          shareholders: this.shareholders
        };
        const mailform = localStorage.getItem('mailform');
        this.personalInfo = mailform ? JSON.parse(mailform) : {};
        
        // Save Step 2 data to localStorage
        localStorage.setItem('mailform1', JSON.stringify(combinedFormData));
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

            if (this.formData.CompanyIncorporated === 'United Arab Emirates') {
              this.router.navigate(['/mails-management-3']);
            } else {
              this.router.navigate(['/mails-management-details']);
            }
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
    return index;
  }

  validateForm(): boolean {
    let isValid = true;
    const missingFields: string[] = [];

    if (!this.formData.CompanyName) {
      missingFields.push('CompanyName');
      isValid = false;
    }

    if (!this.formData.CompanyIncorporated) {
      missingFields.push('CompanyIncorporated');
      isValid = false;
    }

    if (missingFields.length > 0) {
      const message = `All fields are required`;
      this.toastr.error(message);
    }

    return isValid;
  }


  preventManualInput(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent manual input via keyboard
  }
  
  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker(); // Explicitly trigger the date picker
  }
}
