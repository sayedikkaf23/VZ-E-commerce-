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

import { BackAccountOpeningComponent } from './back-account-opening/back-account-opening.component';

import { SettingsComponent } from './settings/settings.component';

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
    path: 'step-1',
    component: Step1Component,
   
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
        path: 'banck-account-opening',
        component: BackAccountOpeningComponent,
       
      },
      {
        path: 'admin-settings',
        component: SettingsComponent,
       
      },
      
    ],
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
