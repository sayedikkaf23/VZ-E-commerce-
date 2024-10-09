import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service'; // Import UserService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  changetype: boolean = true;
  permissions: any = [];

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  togglePasswordField(): void {
    this.changetype = !this.changetype;
  }

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit(): void {
    const bodyElement = document.body;
    bodyElement.classList.add('login-page');
    this.cdr.detectChanges();
  }

  submit(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value ?? ''; // Ensure email is not null/undefined
      const password = this.loginForm.get('password')?.value ?? ''; // Ensure password is not null/undefined
  
      // Call the login method from the UserService
      this.userService.login(email, password).subscribe(
        (response) => {
          console.log('Login successful:', response);
          // Redirect user after successful login
          this.router.navigate(['/dashboard']); // Change to your desired route
        },
        (error) => {
          console.error('Login failed:', error);
          // Handle login error, show notification or error message
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }
  
  

  ngOnDestroy() {
    const bodyElement = document.body;
    bodyElement.classList.remove('login-page');
  }
}
