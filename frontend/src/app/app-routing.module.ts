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
import { MailMangamentFormComponent } from './mail-mangament-form/mail-mangament-form.component';
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
import { MailsManagement2Component } from './mails-management-2/mails-management-2.component';
import { MailsManagementShowDetailsComponent } from './mails-management-show-details/mails-management-show-details.component';
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
  // new
  {
    path: 'mail-management-1',
    component: MailsManagement1Component,
   
  },
  {
    path: 'mail-management-2',
    component: MailsManagement2Component,
   
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
  {
    path: 'mailform',
    component: MailMangamentFormComponent,
   
  },
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
    path: 'BusinessBankShowDetails',
    component: MailMangamentShowDetailsComponent,
   
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
     
      
    ],
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
