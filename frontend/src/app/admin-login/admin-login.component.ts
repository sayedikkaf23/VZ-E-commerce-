import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminAuthService } from '../service/admin-auth.service'; // Import the service
import { Router } from '@angular/router'; // Import the Router

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private authService: AdminAuthService,// Inject the service
    private router: Router,  // Inject Router for navigation

  ) {
    // Initialize form controls
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email field with validation
      password: ['', [Validators.required]] // Password field with validation
    });
  }

  ngOnInit(): void {}

  // Submit function to handle form submission
  submit(): void {
    console.log('Submit button clicked'); // Verify if submit button is clicked

    if (this.loginForm.valid) {


      // Get form values
      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      // Call the admin login method with JSON data
      this.authService.adminLogin(loginData).subscribe(
        (response) => {
          console.log('Login successful', response); // Handle success
          // Navigate or show success message
          this.router.navigate(['/panel/dashboard']);
        },
        (error) => {
          console.log('Login failed', error); // Handle error
        }
      );
    } else {
      console.log('Form is invalid'); // Log if form is invalid
    }
  }
}
