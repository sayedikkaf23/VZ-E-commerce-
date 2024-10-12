import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { _HomeComponent } from './home/home.component';
import { Step1Component } from './step-1/step-1.component';
import { AccountSectionComponent } from './account-section/account-section.component';
import { Step2Component } from './step-2/step-2.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

const routes: Routes = [


  {
    path: '',
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
    path: 'admin/login',
    component: AdminLoginComponent,
   
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
