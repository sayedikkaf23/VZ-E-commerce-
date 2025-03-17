import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../service/user.service';
import { ToastrService } from 'ngx-toastr'; 
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  savedEmail: any;
  isLoading = false;


  constructor(private fb: FormBuilder, private route: ActivatedRoute,   private toastr: ToastrService,

    private userService: UserService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    // Get saved email from local storage
    this.savedEmail = localStorage.getItem('forgotEmail');
    if (this.savedEmail) {
      this.forgotPasswordForm.patchValue({ email: this.savedEmail });
    }
  }

  submit() {
    const email = this.forgotPasswordForm.value.email;
    this.isLoading = true;
  
    this.userService.forgotPassword(email).subscribe(
      (response) => {
        console.log("Reset link sent:", response);
        // alert("A password reset link has been sent to your email.");
        this.isLoading = false;

        this.toastr.success('A password reset link has been sent to your email.', 'Success');
      },
      (error) => {
        console.error("Error sending reset link:", error);
        this.toastr.error(
          error?.error?.message || "Failed to send reset link!",
          'Error'
        ); // Handle error response
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy(): void { // Implement ngOnDestroy
    if (typeof window !== 'undefined' && document) {
    localStorage.removeItem('forgotEmail'); // Remove when component is destroyed
    }
  }

}
