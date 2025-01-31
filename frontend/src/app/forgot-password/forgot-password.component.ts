import { Component, QueryList, ViewChildren, ElementRef, ChangeDetectorRef} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

 

   loginForm: FormGroup;
   passwordVisible: boolean = false;
   passwordVisible2: boolean = false;
   newPasswordForm: FormGroup;
   showEmailForm = true;
   showOtpModal = false;
   showNewPasswordForm = false;
    otp: string[] = ['','','',''];
    enteredOTP: string = '';

    @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  

    
  
    constructor(
      private fb: FormBuilder,
      private toastr: ToastrService,
      private cdr: ChangeDetectorRef
    ) {
      // Initialize the form
      this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
      });

      this.newPasswordForm = this.fb.group({
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      });
    }
  
   

  
    
    submit(): void {
      if (this.loginForm.invalid) {
        this.toastr.error('Enter a valid email address', 'Error');
        return;
      }
  
      // If email is valid, open OTP modal
      this.openOtpModal();
    }


     // Show OTP Modal when NEXT is clicked
  openOtpModal() {
    this.showOtpModal = true;
  }
  

  // Close OTP Modal
  closeOtpModal() {
    this.showOtpModal = false;
  }

  // Verify OTP (You can add API call here)
  verifyOtp() {
  
    if (this.enteredOTP.length === 4) {
      this.showOtpModal = false;
      this.showEmailForm = false;
      this.showNewPasswordForm = true;
    }

    console.log("otp - ", this.enteredOTP);
  }

  ngAfterViewInit(): void {
    // Automatically set focus to the first field after view initialization
    const otpInputArray = this.otpInputs.toArray();
    otpInputArray[0].nativeElement.focus();
  }

  // Handles input event and focuses the next input field
  handleInput(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    
     // Construct the OTP string dynamically from input fields
  const otpInputsArray = this.otpInputs.toArray();
  this.enteredOTP = otpInputsArray.map(input => input.nativeElement.value).join('');

    // If the current input has a value, move focus to the next input field
    if (inputElement.value.length === 1 && index < this.otp.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  // Handles backspace event and moves focus to the previous input field if needed
  handleBackspace(event: KeyboardEvent, index: number): void {
    const inputElement = event.target as HTMLInputElement;

    // Move focus to the previous field if the input is empty
    if (event.key === 'Backspace' && inputElement.value === '') {
      if (index > 0) {
        this.otpInputs.toArray()[index - 1].nativeElement.focus();
      }
    }
  }

  submitNewPassword() {
    if (this.newPasswordForm.valid) {
      const { newPassword, confirmPassword } = this.newPasswordForm.value;
      if (newPassword === confirmPassword) {
        alert('Password successfully changed!');
      } else {
        alert('Passwords do not match!');
      }
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  togglePasswordVisibility2(): void {
    this.passwordVisible2 = !this.passwordVisible2;
  }

  


}
