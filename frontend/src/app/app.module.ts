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
import { BackAccountOpeningComponent } from './back-account-opening/back-account-opening.component';
import { SettingsComponent } from './settings/settings.component';
import { PaymentModesManagementComponent } from './payment-modes-management/payment-modes-management.component';
import { FooterComponent } from './footer/footer.component';
import { UserHeaderComponent } from './user-header/user-header.component';
// import { MailMangamentFormComponent } from './mail-mangament-form/mail-mangament-form.component';
import { BusinessBankAccountComponent } from './business-bank-account/business-bank-account.component';
import { MailMangamentForm2Component } from './mail-mangament-form-2/mail-mangament-form-2.component';
import { MailMangamentShowDetailsComponent } from './mail-mangament-show-details/mail-mangament-show-details.component';
import { CustomerManagementComponent } from './customer-management/customer-management.component';
import { VirtualReceptionistComponent } from './virtual-receptionist/virtual-receptionist.component';
import { VirtualReceptionist1Component } from './virtual-receptionist-1/virtual-receptionist-1.component';
import { VirtualReceptionist2Component } from './virtual-receptionist-2/virtual-receptionist-2.component';
import { VirtualReceptionistDetailsComponent } from './virtual-receptionist-details/virtual-receptionist-details.component';
import { MailsManagement1Component } from './mails-management-1/mails-management-1.component';
import { MailsManagement2Component } from './mails-management-2/mails-management-2.component';
import { MailsManagementShowDetailsComponent } from './mails-management-show-details/mails-management-show-details.component';
import { MailsManagement3Component } from './mails-management-3/mails-management-3.component';
import { AdminMailManagementComponent } from './admin-mail-management/admin-mail-management.component';
import { VirtualManagementComponent } from './virtual-management/virtual-management.component';
import { ShowDetails2Component } from './show-details-2/show-details-2.component';
import { BussinessShowDeatilsComponent } from './bussiness-show-deatils/bussiness-show-deatils.component';
import { VirtualReceptionSummaryComponent } from './virtual-reception-summary/virtual-reception-summary.component';
import { AdminPaymentMethordComponent } from './admin-payment-methord/admin-payment-methord.component';
import { MailsManagementSummaryComponent } from './mails-management-summary/mails-management-summary.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { OnlinepaymentComponent } from './onlinepayment/onlinepayment.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserFooterComponent } from './user-footer/user-footer.component';
import { FailerComponent } from './failer/failer.component';
import { SuccessComponent } from './success/success.component';
import { UserDashboardLayoutComponent } from './user-dashboard-layout/user-dashboard-layout.component';
// import { RouterModule } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ClientHeaderComponent } from './client-header/client-header.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { ServicePageComponent } from './service-page/service-page.component';
import { UserNavComponent } from './user-nav/user-nav.component';
import { CustomerCardmanagementComponent } from './customer-cardmanagement/customer-cardmanagement.component';
import { AlreadypaidComponent } from './alreadypaid/alreadypaid.component';
import { CardmachineComponent } from './cardmachine/cardmachine.component';
import { CashoverCounterComponent } from './cashover-counter/cashover-counter.component';
import { CashovercounterComponent } from './cashovercounter/cashovercounter.component';
import { CashoversuccessComponent } from './cashoversuccess/cashoversuccess.component';
import { BankTransferSuccessComponent } from './bank-transfer-success/bank-transfer-success.component';


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
    BackAccountOpeningComponent,
    SettingsComponent,
    PaymentModesManagementComponent,
    FooterComponent,
    UserHeaderComponent,
    ServicePageComponent,
    // MailMangamentFormComponent,
    BusinessBankAccountComponent,
    MailMangamentForm2Component,
    MailMangamentShowDetailsComponent,
    CustomerManagementComponent,
    VirtualReceptionistComponent,
    VirtualReceptionist1Component,
    VirtualReceptionist2Component,
    VirtualReceptionistDetailsComponent,
    MailsManagement1Component,
    MailsManagement2Component,
    MailsManagementShowDetailsComponent,
    MailsManagement3Component,
    AdminMailManagementComponent,
    VirtualManagementComponent,
    ShowDetails2Component,
    BussinessShowDeatilsComponent,
    VirtualReceptionSummaryComponent,
    AdminPaymentMethordComponent,
    MailsManagementSummaryComponent,
    UserLoginComponent,
    OnlinepaymentComponent,
    SidebarComponent,
    CardmachineComponent,
    CashoverCounterComponent,
    UserFooterComponent,
    FailerComponent,
    SuccessComponent,
    UserDashboardLayoutComponent,
    UserDashboardComponent,
    ClientHeaderComponent,
    UserNavComponent,
    CustomerCardmanagementComponent,
    AlreadypaidComponent,
    CashovercounterComponent,
    CashoversuccessComponent,
    BankTransferSuccessComponent,
    
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,            // Add FormsModule to imports
    ToastrModule.forRoot({
      positionClass: 'toast-top-center', // Center the toast notifications at the top
      preventDuplicates: true,           // Prevent duplicate messages
      toastClass: 'custom-toast',        // Custom class for styling
    }),
    
      
     NgxIntlTelInputModule,
    BsDropdownModule.forRoot(),

    // HttpClientModule is no longer needed here
  ],
  
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],

  providers: [
    provideHttpClient(withInterceptorsFromDi()) 
    // Use the new HttpClient setup,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
