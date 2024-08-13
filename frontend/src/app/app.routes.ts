import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SmComponent } from './sm/sm.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'sm', component: SmComponent },
];
