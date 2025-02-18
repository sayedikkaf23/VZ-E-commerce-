import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminAuthService } from '../service/admin-auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Import ToastrServiceImport ToastrService
@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {

  loginForm: FormGroup;
  passwordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AdminAuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Initialize the form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  
  submit(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value; // Access values directly from the form group
  
      this.authService.login(loginData).subscribe(
        (response) => {
          // Save email to localStorage
          if (response && response.email) {
            localStorage.setItem('userEmail', response.email);
          }
  

          this.toastr.success('Login successful!', 'Success'); // Show success notification
          this.router.navigate(['/user/dashboard']); 
        },
        (error) => {
          this.toastr.error(
            error?.error?.message || 'Login failed! Please check your credentials.',
            'Error'
          ); // Handle error response
          console.error('Login failed:', error);
        }
      );
    } else {
      this.toastr.warning('Please fill in all required fields!', 'Warning'); // Show validation warning
    }
  }
  forgotPassword() {
    const email = this.loginForm.get('email')?.value;
    if (email) {
      localStorage.setItem('forgotEmail', email); // Save email in local storage
    }
    this.router.navigate(['/forgot-password']); // Redirect to Forgot Password page
  }
  
  
}