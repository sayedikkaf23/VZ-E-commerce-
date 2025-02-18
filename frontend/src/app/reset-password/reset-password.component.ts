import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  resetPasswordForm: FormGroup;
  token: string | null = null; // Store token from URL
  passwordVisible = false;
  passwordVisible2 = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
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
    if (this.resetPasswordForm.invalid) {
      this.toastr.warning('Please fill in all required fields!', 'Warning');
      return;
    }
      const { newPassword, confirmPassword } = this.resetPasswordForm.value;

    
        // Trim spaces and check if the fields are empty
  if (!newPassword?.trim() || !confirmPassword?.trim()) {
    this.toastr.warning('Both password fields are required!', 'Warning');
    return;
  }

      if (newPassword !== confirmPassword) {
        // alert('Passwords do not match!');
        this.toastr.warning('Passwords do not match!', 'Warning');
        return;
      }

      if (!this.token) {
        // alert('Invalid or missing token!');
        this.toastr.warning('Invalid or missing token!', 'Warning');
        return;
      }

      this.userService.resetPassword(this.token, newPassword).subscribe(
        (response) => {
          console.log('Password reset successful', response);
         
          this.toastr.success('Password reset successfully!', 'Success'); 
          
          this.router.navigate(['/login']); 
        },
        (error) => {
          console.error('Error resetting password', error);
          this.toastr.error(
            error?.error?.message || 'An error occurred. Please try again.',
            'Error'
          );
        }
      );
    
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  togglePasswordVisibility2() {
    this.passwordVisible2 = !this.passwordVisible2;
  }
}
