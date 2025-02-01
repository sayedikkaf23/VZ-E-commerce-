import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminAuthService } from '../service/admin-auth.service';
import { Router } from '@angular/router';
import e from 'express';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string | null = null; // Store token from URL

  constructor(
    private route: ActivatedRoute,
    private authService: AdminAuthService,
    private router: Router,

  ) {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    // Extract token from URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token']; // Get the token from URL
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      const { newPassword, confirmPassword } = this.resetPasswordForm.value;

      if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      if (!this.token) {
        alert('Invalid or missing token!');
        return;
      }

      this.authService.resetPassword(this.token, newPassword).subscribe(
        (response) => {
          console.log('Password reset successful', response);
          alert('Password reset successfully!');
          
          this.router.navigate(['/login']); 
        },
        (error) => {
          console.error('Error resetting password', error);
          alert(error?.error?.message || 'An error occurred. Please try again.');
        }
      );
    }
  }
}
