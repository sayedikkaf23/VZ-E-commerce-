import { Component, Inject, PLATFORM_ID, AfterViewInit, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import AOS from 'aos';

declare var $: any;

@Component({
  selector: 'app-virtual-receptionist-2',
  templateUrl: './virtual-receptionist-2.component.html',
  styleUrls: ['./virtual-receptionist-2.component.css']
})
export class VirtualReceptionist2Component implements AfterViewInit, OnInit {
  formData: FormGroup;
  uploadedFiles: File[] = []; // To hold the uploaded files

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize form with validation
    this.formData = this.fb.group({
      companyTradeLicense: ['', Validators.required],
      shareholderId: ['', Validators.required],
      passportCopy: [null, Validators.required]
    });
  }

  ngOnInit() {
    // Scroll to top when the page loads
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    // Load saved data if it exists in localStorage
    const savedData = localStorage.getItem('virtualdata2');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.formData.patchValue(parsedData);
      if (parsedData.uploadedFiles) {
        this.uploadedFiles = parsedData.uploadedFiles;
      }
    }
  }

  ngAfterViewInit() {
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

  onFileChange(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      // Append new files, up to 4 unique files in total
      const newFiles = Array.from(fileList).slice(0, 4); // Limit selection to 4 files
  
      // Avoid duplicates
      newFiles.forEach(newFile => {
        if (!this.uploadedFiles.some(file => file.name === newFile.name)) {
          this.uploadedFiles.push(newFile);
        }
      });
  
      // If uploadedFiles exceeds 4 files after adding new ones, trim the array
      if (this.uploadedFiles.length > 4) {
        this.uploadedFiles = this.uploadedFiles.slice(0, 4);
      }
  
      // Update the form control with file names
      this.formData.patchValue({ passportCopy: this.uploadedFiles.map(file => file.name) });
    }
  }
  
  

  onSubmit() {
    if (this.formData.valid) {
      const formValues = this.formData.value;

      // Save form data and uploaded file names to local storage
      const dataToSave = { ...formValues, uploadedFiles: this.uploadedFiles.map(file => ({ name: file.name })) };
      localStorage.setItem('virtualdata2', JSON.stringify(dataToSave));

      console.log('Form Data:', formValues);  // Debugging: Display form data in console

      // Navigate to the next page
      this.router.navigate(['/virtual-receptionist-details']);
    } else {
      console.log('Please fill all required fields');
    }
  }
}
