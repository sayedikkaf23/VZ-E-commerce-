import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule correctly
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { Step1Component } from './step-1/step-1.component';
import { Step2Component } from './step-2/step-2.component';
import { AccountSectionComponent } from './account-section/account-section.component';

@NgModule({
  declarations: [
    AppComponent,
    Step1Component, // Add your other components here
    Step2Component,
    AccountSectionComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // Correctly placed in imports
    ReactiveFormsModule, // ReactiveFormsModule should be in imports
    ToastrModule.forRoot(), // Correct way to import ToastrModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
