import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SmComponent } from './sm/sm.component';
import { AccountSectionComponent } from './account-section/account-section.component';
import { Step1Component } from './step-1/step-1.component';
import { Step2Component } from './step-2/step-2.component';
import { LoginComponent } from './login/login.component';
import { FooterComponent } from './footer/footer.component';
import { GolderVisaComponent } from './golder-visa/golder-visa.component';
import { AccountingVatComponent } from './accounting-vat/accounting-vat.component';
import { MailManagementComponent } from './mail-management/mail-management.component';
import { VirtualReceptionistComponent } from './virtual-receptionist/virtual-receptionist.component';
import { CertificateIncorporationComponent } from './certificate-incorporation/certificate-incorporation.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [

  { path: 'home', component: HomeComponent }, // Set path to '/home'
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect the empty path to '/home'
  { path: 'sm', component: SmComponent },
  { path: 'account-type', component: AccountSectionComponent },
  { path: 'step-1', component: Step1Component },
  { path: 'step-2', component: Step2Component },
  { path: 'login', component: LoginComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'golden-visa', component: GolderVisaComponent },
  { path: 'accounting-vat', component: AccountingVatComponent },
  { path: 'mail-management', component: MailManagementComponent },
  { path: 'virtual-receptionist', component: VirtualReceptionistComponent },
  { path: 'certificate-incorporation', component: CertificateIncorporationComponent },


  {
    path: 'panel',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      
      },
    
    ],
  },






];
