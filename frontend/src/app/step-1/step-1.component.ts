import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf and *ngFor


import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClientModule and HttpClient
import { ChangeDetectorRef } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; 

import { FormDataService } from '../service/form-data.service'; // Import the shared service

declare const AOS: any;
declare const $: any;

@Component({
  selector: 'app-step-1',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule,CommonModule], // Ensure ReactiveFormsModule and HttpClientModule are imported here
  templateUrl: './step-1.component.html',
  styleUrls: ['./step-1.component.css'],
})
export class Step1Component implements AfterViewInit, OnInit {
  personalDetailsForm: FormGroup;
  nationalities: string[] = []; // Initialize as an empty array
  selectedNationality: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private formDataService: FormDataService, // Inject the service
    private http: HttpClient ,// Inject HttpClient here
    private cdRef: ChangeDetectorRef // Inject ChangeDetectorRef to manually trigger change detection

  ) {
    this.personalDetailsForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nationality: ['', Validators.required],
      birthday: { type: Date, required: true },
    });
  }

  ngOnInit(): void {
    // Fetch nationalities using REST Countries API
    this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe((data) => {
      // Map the API response to get country names
      this.nationalities = data.map((country) => country.name.common);
      console.log(this.nationalities); // Verify that the nationalities array is populated
      this.cdRef.detectChanges(); // Manually trigger change detection to update the view
    });
  }

  ngAfterViewInit() {
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

  onSubmit() {
    if (this.personalDetailsForm.valid) {
      // Save the form data in the shared service
      this.formDataService.setStep1Data(this.personalDetailsForm.value);
      console.log(this.personalDetailsForm.value);
      this.router.navigate(['/step-2']);
    } else {
      console.log('Form is invalid');
    }
  }
}
