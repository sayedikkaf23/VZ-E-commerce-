import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormDataService } from '../service/form-data.service';
import { UserService } from '../service/user.service';
import AOS from 'aos';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { GetnationalityService } from '../service/getnationality.service';
declare var $: any;

@Component({
  selector: 'app-virtual-receptionist-1',
  templateUrl: './virtual-receptionist-1.component.html',
  styleUrl: './virtual-receptionist-1.component.css',
})
export class VirtualReceptionist1Component implements OnInit, AfterViewInit {
  @ViewChild('dateInput') dateInput!: ElementRef;

  formData: any = {
    CompanyName: '',
    CompanyIncorporated: '',
    Website: '',
    tradelicense: '',
    shareholdercount: '',
    Companylicensed: '',
  };

  shareholders: any[] = [
    {
      name: '',
      shareholderPercentage: '',
      dob: '',
      nationalityshareholder: '',
    },
  ]; // Initialize with one shareholder

  isValidSalary = true;
  files: { passport?: File; salaryStatements?: File[] } = {};
  step1Data: any = {}; // To store Step 1 data
  nationalities: string[] = []; 
  nationalitiesData: string[] = []; 

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
    this.step1Data = this.formDataService.getvirtualdata();
    // console.log('Step 1 data:', this.step1Data);
  }

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
    // Retrieve countries and nationalities
    this.getnationalityService.getCountries().subscribe((data) => {
      // Map and trim whitespace, sort case-insensitively
      this.nationalities = data
        .map((country: { name: { common: string } }) => country.name.common.trim())
        .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
      // Trigger change detection to update the view
      this.cdRef.detectChanges();
    });

    this.getnationalityService.getNationality().subscribe((data) => {
      this.nationalitiesData = data.map((country: { name: { common: any; }; }) => country.name.common);
      this.cdRef.detectChanges();
    });

    // Retrieve saved data from localStorage
    const storedStep2Data = localStorage.getItem('virtualdata1');
    if (storedStep2Data) {
      const parsedData = JSON.parse(storedStep2Data);

      this.formData = {
        CompanyName: parsedData.CompanyName,
        CompanyIncorporated: parsedData.CompanyIncorporated,
        Website: parsedData.Website,
        tradelicense: parsedData.tradelicense,
        shareholdercount: parsedData.shareholdercount,
        Companylicensed: parsedData.Companylicensed,
      };

      if (parsedData.shareholders) {
        this.shareholders = parsedData.shareholders;
      }

      // Call updateShareholders() after loading from localStorage
      this.updateShareholders();

      this.cdRef.detectChanges();
    }
  }

  ngAfterViewInit() {
    const Tooltip = (window as any).Tooltip;
    Tooltip.initAll();
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
    this.shareholders.push({
      name: '',
      shareholderPercentage: '',
      dob: '',
      nationalityshareholder: '',
    });
    this.cdRef.detectChanges();
  }


  preventManualInput(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent manual input via keyboard
  }
  
  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker(); // Explicitly trigger the date picker
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
    const count = parseInt(this.formData.shareholdercount, 10) || 0;

    while (this.shareholders.length < count) {
      this.shareholders.push({
        name: '',
        shareholderPercentage: '',
        dob: '',
        nationalityshareholder: '',
      });
    }

    while (this.shareholders.length > count) {
      this.shareholders.pop();
    }
  }

  isFormInvalid(): boolean {
    const shareholderCount = Number(this.formData.shareholdercount);

    for (let i = 0; i < shareholderCount; i++) {
      const shareholder = this.shareholders[i];
      if (
        !shareholder ||
        !shareholder.name ||
        !shareholder.shareholderPercentage ||
        !shareholder.dob ||
        !shareholder.nationalityshareholder
      ) {
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
        this.shareholders.forEach((shareholder, index) => {
          formDataToSend.append(`shareholders[${index}]`, JSON.stringify(shareholder));
        });

        const combinedFormData = {
          ...this.formData,
          shareholders: this.shareholders,
        };

        // Save Step 2 data to localStorage
        localStorage.setItem('virtualdata1', JSON.stringify(combinedFormData));

        if (this.formData.CompanyIncorporated === 'United Arab Emirates') {
          this.router.navigate(['/virtual-receptionist-2']);
        } else {
          this.router.navigate(['/virtual-receptionist-details']);
        }
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
}
