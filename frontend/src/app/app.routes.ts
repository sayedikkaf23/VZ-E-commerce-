import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SmComponent } from './sm/sm.component';
import { AccountSectionComponent } from './account-section/account-section.component';
import { Step1Component } from './step-1/step-1.component';
import { Step2Component } from './step-2/step-2.component';
import { LoginComponent } from './login/login.component';
import { FooterComponent } from './footer/footer.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'sm', component: SmComponent },
  { path: 'account-type', component: AccountSectionComponent },
  { path: 'step-1', component: Step1Component },
  { path: 'step-2', component: Step2Component },
  { path: 'login', component: LoginComponent },
  { path: 'footer', component: FooterComponent },






];
