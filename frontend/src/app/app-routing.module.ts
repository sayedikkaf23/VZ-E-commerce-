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

  {
    path: 'onlinepayment/:id',
    component: OnlinepaymentComponent,
    data: { type: 'online' },
  },
  // { path: 'successful/:id', component: SuccessComponent },
  { path: 'failure/:id', component: FailerComponent },
  // new
  { path: 'successful/:id', component: SuccessComponent },

  {
    path: 'mail-management-1',
    component: MailsManagement1Component,
   
  },
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
  // end
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
 
  {
    path: 'virtual-receptionist-details',
    component: VirtualReceptionistDetailsComponent,
   
  },
  {
    path: 'login',
    component: UserLoginComponent,
   
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
   
  },

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
        path: 'payment-methord',
        component:AdminPaymentMethordComponent,
       
      },
      {
        path: 'admin-virtual-management',
        component: VirtualManagementComponent,
       
      },
     
      
    ],
  },
  {
    path: 'user',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: UserDashboardComponent,
       
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
        path: 'payment-methord',
        component:AdminPaymentMethordComponent,
       
      },
      {
        path: 'admin-virtual-management',
        component: VirtualManagementComponent,
       
      },
     
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
