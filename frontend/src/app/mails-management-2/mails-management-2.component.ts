import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { GetnationalityService } from '../service/getnationality.service';
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
  styleUrl: './mails-management-2.component.css'
})
export class MailsManagement2Component {
  @ViewChild('dateInput') dateInput!: ElementRef;

  formData: any = {
    CompanyName: '',
    CompanyIncorporated: '',
    Website: '',
    tradelicense:'',
    shareholdercount:'',
    Companylicensed:'',

  };
  shareholders: any[] = [{ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '' }]; // Initialize with one shareholder

  openDatePicker() {
    if (this.dateInput && this.dateInput.nativeElement) {
      this.dateInput.nativeElement.focus();  // Ensure the input is focused
      this.dateInput.nativeElement.click();  // Programmatically click the input to open the date picker
    }
  }
  
  
  isValidSalary = true;
  files: { passport?: File; salaryStatements?: File[] } = {};
  step1Data: any = {}; // To store Step 1 data
  nationalities: string[] = []; // Initialize as an empty array


  constructor(
    private formDataService: FormDataService,
    private http: HttpClient,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private getnationalityService: GetnationalityService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Retrieve Step 1 data from the service when Step 2 initializes
    this.step1Data = this.formDataService.getmailformData();
    console.log('Step 1 data:', this.step1Data);
  }

  ngOnInit(): void {
    // Retrieve Step 2 data from localStorage

    this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe((data) => {
      this.nationalities = data.map((country) => country.name.common);
      this.cdRef.detectChanges(); 
    });
    // this.getnationalityService.getNationality().subscribe((data) => {
    //   this.nationalities =  data.map((country: { name: { common: any; }; }) => country.name.common); // Get the Label values
    //   this.cdRef.detectChanges(); // Trigger change detection to update the view
    // });
    const storedStep2Data = localStorage.getItem('mailform1');
    if (storedStep2Data) {
      const parsedData = JSON.parse(storedStep2Data);
      
      // Update formData and shareholders separately
      this.formData = { 
        CompanyName: parsedData.CompanyName, 
        CompanyIncorporated: parsedData.CompanyIncorporated, 
        Website: parsedData.Website, 
      
        tradelicense:parsedData.tradelicense,
        shareholdercount: parsedData.shareholdercount,
        Companylicensed:parsedData.Companylicensed
      };
      
      // Update shareholders if it exists in the parsed data
      if (parsedData.shareholders) {
        this.shareholders = parsedData.shareholders;
      }
    
      // Trigger change detection if necessary
      this.cdRef.detectChanges();
    }
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
    console.log('Add shareholder clicked');
    this.shareholders.push({ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '' });
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
    const count = parseInt(this.formData.shareholdercount, 10); // Convert count to number

    // If the selected count is greater than current length, add more shareholder objects
    while (this.shareholders.length < count) {
      this.shareholders.push({ name: '', shareholderPercentage: '', dob: '', nationalityshareholder: '' });
    }

    // If the selected count is smaller, remove extra shareholder objects
    while (this.shareholders.length > count) {
      this.shareholders.pop();
    }
  }

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
        this.shareholders.forEach((shareholder, index) => {
          formDataToSend.append(`shareholders[${index}]`, JSON.stringify(shareholder));
        });

        const combinedFormData = {
          ...this.formData, // Spread formData properties
          shareholders: this.shareholders // Add the shareholders array
        };
        
        // Save Step 2 data to localStorage
        localStorage.setItem('mailform1', JSON.stringify(combinedFormData));


        if (this.formData.CompanyIncorporated == 'United Arab Emirates') {
          // Navigate to the route for UAE-specific details
          this.router.navigate(['/mails-management-3']);
        } else {
          // Navigate to the standard route
          this.router.navigate(['/mails-management-details']);
        }

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

console.log(missingFields)

    if (!this.formData.CompanyName) {
      missingFields.push('CompanyName');
      isValid = false;
    }
    if (!this.formData.CompanyIncorporated) {
      missingFields.push('CompanyIncorporated');
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

