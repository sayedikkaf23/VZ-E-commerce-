import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminAuthService } from '../service/admin-auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AdminAuthService,
    private router: Router,
    private toastr: ToastrService // Inject ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  submit(): void {
    if (this.loginForm.valid) {
      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.adminLogin(loginData).subscribe(
        (response) => {
          this.toastr.success('Login successful!', 'Success'); // Success notification
          this.router.navigate(['/panel/dashboard']);
        },
        (error) => {
          this.toastr.error('Login failed! Please check your credentials.', 'Error'); // Error notification
          console.log('Login failed', error); 
        }
      );
    } else {
      this.toastr.warning('Please fill in all required fields!', 'Warning'); // Validation warning
    }
  }
}
