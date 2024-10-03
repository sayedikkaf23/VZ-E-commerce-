import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';  // Import ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http';

import { Step1Component } from './step-1/step-1.component';
@NgModule({
  declarations: [
    AppComponent,

    Step1Component,
    // Add other components here
    ReactiveFormsModule,
    HttpClientModule
  ],
  imports: [
    BrowserModule,
    // Add other modules here if needed
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
