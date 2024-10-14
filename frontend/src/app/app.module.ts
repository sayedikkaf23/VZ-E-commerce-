import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // Import the necessary methods
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { _HomeComponent } from './home/home.component';
import { Step1Component } from './step-1/step-1.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Import FormsModule and ReactiveFormsModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { AccountSectionComponent } from './account-section/account-section.component';
import { Step2Component } from './step-2/step-2.component';  // Import ReactiveFormsModule
import { ToastrModule } from 'ngx-toastr';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShowDetailsComponent } from './show-details/show-details.component';


@NgModule({
  declarations: [
    AppComponent,
    _HomeComponent,
    Step1Component,
    AccountSectionComponent,
    Step2Component,
    AdminLoginComponent,
    DashboardLayoutComponent,
    HeaderComponent,
    DashboardComponent,
    ShowDetailsComponent,
    
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,            // Add FormsModule to imports
    ToastrModule.forRoot(), // ToastrModule added
    NgxIntlTelInputModule,
    BsDropdownModule.forRoot(),

    // HttpClientModule is no longer needed here
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],

  providers: [
    provideHttpClient(withInterceptorsFromDi()) // Use the new HttpClient setup
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
