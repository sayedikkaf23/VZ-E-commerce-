import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthService } from '../service/admin-auth.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  resetRequestForm: FormGroup;
  newPasswordForm: FormGroup;

  showEmailForm = true;
  showNewPasswordForm = false;

  passwordVisible = false;
  passwordVisible2 = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AdminAuthService,
  ) {
    this.resetRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.newPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Check if a token is present in the URL (e.g., /reset-password?token=123abc)
    const token = this.route.snapshot.queryParamMap.get('token');

    // If a token is present, we might show the new password form 
    // and hide the email form.
    if (token) {
      this.showEmailForm = false;
      this.showNewPasswordForm = true;
      // Optionally, store token somewhere (service, local variable, etc.)
    }
  }

  requestResetLink() {
    if (this.resetRequestForm.invalid) return;
  
    const email = this.resetRequestForm.value.email;
  
    this.authService.forgotPassword(email).subscribe(
      (response) => {
        console.log("Reset link sent:", response);
        alert("A password reset link has been sent to your email.");
        this.router.navigate(['/login']); 
      },
      (error) => {
        console.error("Error sending reset link:", error);
        alert(error?.error?.message || "Failed to send reset link!");
      }
    );
  }
  


  // Toggle password visibility
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  togglePasswordVisibility2() {
    this.passwordVisible2 = !this.passwordVisible2;
  }
}
