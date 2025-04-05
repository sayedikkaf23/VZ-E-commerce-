import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { _HomeComponent } from './home/home.component';
import { Step1Component } from './step-1/step-1.component';
import { AccountSectionComponent } from './account-section/account-section.component';
import { Step2Component } from './step-2/step-2.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { ShowDetailsComponent } from './show-details/show-details.component';
// import { MailMangamentFormComponent } from './mail-mangament-form/mail-mangament-form.component';
import { BackAccountOpeningComponent } from './back-account-opening/back-account-opening.component';
import { BusinessBankAccountComponent } from './business-bank-account/business-bank-account.component';
import { MailMangamentForm2Component } from './mail-mangament-form-2/mail-mangament-form-2.component';
import { SettingsComponent } from './settings/settings.component';
import { PaymentModesManagementComponent } from './payment-modes-management/payment-modes-management.component';
import { MailMangamentShowDetailsComponent } from './mail-mangament-show-details/mail-mangament-show-details.component';
import { CustomerManagementComponent } from './customer-management/customer-management.component';
import { VirtualReceptionistComponent } from './virtual-receptionist/virtual-receptionist.component';
import { VirtualReceptionist1Component } from './virtual-receptionist-1/virtual-receptionist-1.component';
import { VirtualReceptionist2Component } from './virtual-receptionist-2/virtual-receptionist-2.component';
import { VirtualReceptionistDetailsComponent } from './virtual-receptionist-details/virtual-receptionist-details.component';
import { MailsManagement1Component } from './mails-management-1/mails-management-1.component';
import { MailsManagementShowDetailsComponent } from './mails-management-show-details/mails-management-show-details.component';
import { MailsManagement2Component } from './mails-management-2/mails-management-2.component';
import { MailsManagement3Component } from './mails-management-3/mails-management-3.component';
import { AdminMailManagementComponent } from './admin-mail-management/admin-mail-management.component';
import { VirtualManagementComponent } from './virtual-management/virtual-management.component';
import { ShowDetails2Component } from './show-details-2/show-details-2.component';
import { VirtualReceptionSummaryComponent } from './virtual-reception-summary/virtual-reception-summary.component';
import { BussinessShowDeatilsComponent } from './bussiness-show-deatils/bussiness-show-deatils.component';
import { MailsManagementSummaryComponent } from './mails-management-summary/mails-management-summary.component';
import { AdminPaymentMethordComponent } from './admin-payment-methord/admin-payment-methord.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { OnlinepaymentComponent } from './onlinepayment/onlinepayment.component';
import { FailerComponent } from './failer/failer.component';
import { SuccessComponent } from './success/success.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UserDashboardLayoutComponent } from './user-dashboard-layout/user-dashboard-layout.component';
import { ServicePageComponent } from './service-page/service-page.component';
import { CardmachineComponent } from './cardmachine/cardmachine.component';
import { CustomerCardmanagementComponent } from './customer-cardmanagement/customer-cardmanagement.component';
import { AlreadypaidComponent } from './alreadypaid/alreadypaid.component';
import { CashovercounterComponent } from './cashovercounter/cashovercounter.component';
import { CashoverCounterComponent } from './cashover-counter/cashover-counter.component';
import { CashoversuccessComponent } from './cashoversuccess/cashoversuccess.component';
import { BankTransferSuccessComponent } from './bank-transfer-success/bank-transfer-success.component';
import { CashdepositComponent } from './cashdeposit/cashdeposit.component';
import { BanktransferComponent } from './banktransfer/banktransfer.component';
import { ChequedepositComponent } from './chequedeposit/chequedeposit.component';
import { AdminDocumentTypeComponent } from './admin-document-type/admin-document-type.component';
import { PastServiceComponent } from './past-service/past-service.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { HelpCenterComponent } from './help-center/help-center.component';
import { CountryRiskManagementComponent } from './country-risk-management/country-risk-management.component';
import { ProductRiskManagementComponent } from './product-risk-management/product-risk-management.component';
import { RiskComponent } from './risk/risk.component';
const routes: Routes = [

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' // Ensures exact match with the root path
  },
  {
    path: 'home',
    component: _HomeComponent,
   
  },
  { path: 'chequedeposit/:id', component: ChequedepositComponent },
  { path: 'onlinepayments/:id', component: AlreadypaidComponent },
  { path: 'cashdeposit/:id', component: CashdepositComponent },
  {
    path: 'onlinepayment/:id',
    component: OnlinepaymentComponent,
    data: { type: 'online' },
  },
  // { path: 'successful/:id', component: SuccessComponent },
  { path: 'failure/:id', component: FailerComponent },
  // new
  { path: 'successful/:id', component: SuccessComponent },
  { path: 'success/:id', component: BankTransferSuccessComponent },
  { path: 'banktransfer/:id', component: BanktransferComponent },
  {
    path: 'mail-management-1',
    component: MailsManagement1Component,
   
  },
  { path: 'cashovercounter/:id', component: CashovercounterComponent },
  { path: 'cashover-counter/:id', component: CashoverCounterComponent },
  { path: 'cashcountersuccess/:id', component: CashoversuccessComponent },
  {
    path: 'mail-management-2',
    component: MailsManagement2Component,
   
  },
  {
    path: 'bussiness-show-details',
    component: BussinessShowDeatilsComponent,
   
  },
  {
    path: 'mail-management-show-details',
    component: MailsManagementShowDetailsComponent,
   
  },
  {
    path: 'user/dashboard',
    component: CustomerCardmanagementComponent,
   
  },
  {
    path: 'user/pastservice',
    component: PastServiceComponent,
   
  },
  {
    path: 'user/helpcenter',
    component: HelpCenterComponent
   
  },
  //new payment
  // {
  //   path: 'cardmachine',
  //   component: CardmachineComponent,
   
  // },
  // {
  //   path: 'cashdeposite',
  //   component: CashdepositComponent,
   
  // },
  // {
  //   path: 'chequedeposite',
  //   component: ChequedepositComponent,
   
  // },
  // {
  //   path: 'cashover-counter',
  //   component: CashoverCounterComponent,
  // },
  {
    path: 'step-1',
    component: Step1Component,
   
  },
  // {
  //   path: 'mailform',
  //   component: MailMangamentFormComponent,
   
  // },
  {
    path: 'BusinessBankform',
    component: MailMangamentForm2Component,
   
  },
  {
    path: 'step-2',
    component: Step2Component,
   
  },
  {
    path: 'account-type',
    component: AccountSectionComponent,
   
  },
  {
    path: 'ShowDetails',
    component: ShowDetailsComponent,
   
  },
  {
    path: 'ShowDetails-2',
    component: ShowDetails2Component,
   
  },
  {
    path: 'BusinessBankShowDetails',
    component: MailMangamentShowDetailsComponent,
   
  },
  {
    path: 'virtual-receptionist',
    component: VirtualReceptionistComponent,
   
  },
  {
    path: 'virtual-summary',
    component: VirtualReceptionSummaryComponent,
   
  },
  {
    path: 'mails-summary',
    component: MailsManagementSummaryComponent,
   
  },
 
  {
    path: 'mails-management',
    component: MailsManagement1Component,
   
  },
  {
    path: 'mails-management-2',
    component: MailsManagement2Component,
   
  },
  {
    path: 'mails-management-3',
    component: MailsManagement3Component,
   
  },
  {
    path: 'mails-management-details',
    component: MailsManagementShowDetailsComponent,
   
  },
  {
    path: 'virtual-receptionist',
    component: VirtualReceptionistComponent,
   
  },
  {
    path: 'virtual-receptionist-1',
    component: VirtualReceptionist1Component,
   
  },
  {
    path: 'virtual-receptionist-2',
    component: VirtualReceptionist2Component,
   
  },
  { path: 'cardmachine/:id', component: CardmachineComponent },
 
  {
    path: 'virtual-receptionist-details',
    component: VirtualReceptionistDetailsComponent,
   
  },
  {
    path: 'login',
    component: UserLoginComponent,
   
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
   
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
   
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
   
  },
  // {
  //       path: 'user/dashboard',
  //       component: UserDashboardComponent,
       
  //     },
  //     { path: 'services', component: ServicePageComponent },

  // { path: 'user/dashboard', component: UserDashboardComponent },
  { path: 'services', component: ServicePageComponent },
  // { path: '', redirectTo: 'user/dashboard', pathMatch: 'full' }, // Default route
  {
    path: 'panel',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
       
      },
      {
        path: 'PersonalBank-account-opening',
        component: BackAccountOpeningComponent,
       
      },
      {
        path: 'admin-settings',
        component: SettingsComponent,
       
      },
      {
        path: 'payment-modes',
        component: PaymentModesManagementComponent,
       
      },
      {
        path: 'business-bank-account',
        component: BusinessBankAccountComponent,
       
      },

        {
        path: 'customer-management',
        component: CustomerManagementComponent,
       
      },
      {
        path: 'admin-mail-management',
        component: AdminMailManagementComponent,
       
      },
      {
        path: 'country-risk-management',
        component: CountryRiskManagementComponent,
       
      },
      {
        path: 'product-risk-management',
        component: ProductRiskManagementComponent,
       
      },
      {
        path: 'risk',
        component: RiskComponent,
       
      },
      {
        path: 'payment-method',
        component:AdminPaymentMethordComponent,
       
      },
      {
        path: 'admin-virtual-management',
        component: VirtualManagementComponent,
       
      },
      {
        path: 'admin-document-type',
        component: AdminDocumentTypeComponent,
       
      },
     
      
    ],
  },
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
