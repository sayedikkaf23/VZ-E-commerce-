import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

// Standalone components should not be in NgModule
import { Step1Component } from './step-1/step-1.component'; 
import { Step2Component } from './step-2/step-2.component';
import { AccountSectionComponent } from './account-section/account-section.component';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    Step1Component,
    Step2Component,
    AccountSectionComponent
  ],
  providers: [],
  // No bootstrap array here
})
export class AppModule {}
