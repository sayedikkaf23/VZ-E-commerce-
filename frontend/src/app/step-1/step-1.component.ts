import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Correct ReactiveFormsModule import

import { FormDataService } from '../service/form-data.service'; // Import the shared service

declare const AOS: any;
declare const $: any;

@Component({
  selector: 'app-step-1',
  standalone: true,
  imports: [ReactiveFormsModule], // Ensure ReactiveFormsModule is imported here

  templateUrl: './step-1.component.html',
  styleUrls: ['./step-1.component.css'],
})
export class Step1Component implements AfterViewInit {
  personalDetailsForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private formDataService: FormDataService // Inject the service
  ) {
    this.personalDetailsForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nationality: ['', Validators.required], 
      birthday: { type: Date, required: true },
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
console.log(this.personalDetailsForm.value)
      // Navigate to the next page
      this.router.navigate(['/step-2']);
    } else {
      console.log('Form is invalid');
    }
  }
}


