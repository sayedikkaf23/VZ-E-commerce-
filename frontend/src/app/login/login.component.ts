import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';

import { DOCUMENT } from '@angular/common';

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

  ) {}

  ngOnInit(): void {
    const bodyElement = document.body;
    bodyElement.classList.add('login-page');
    this.cdr.detectChanges();
   
  }

  submit(): void {
    console.log("loged")
  }

  ngOnDestroy() {
    const bodyElement = document.body;
    bodyElement.classList.remove('login-page');
  }
}
