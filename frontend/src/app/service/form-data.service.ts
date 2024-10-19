
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormDataService {
  private formData: any = {
    step1: {},
    step2: {},
    mailform: {},
    mailform2: {},
  };

  // Store data from Step 1
  setmailformData(data: any) {
    this.formData.mailform = data;
  }

  // Store data from Step 2
  setmailform2Data(data: any) {
    this.formData.mailform2 = data;
  }

  // Get data from Step 1
  getmailformData() {
    return this.formData.mailform;
  }

  // Get data from Step 2
  getmailform2Data() {
    return this.formData.mailform2;
  }

  // Get all form data
  // getAllFormData() {
  //   return this.formData;
  // }
  setStep1Data(data: any) {
    this.formData.step1 = data;
  }

  // Store data from Step 2
  setStep2Data(data: any) {
    this.formData.step2 = data;
  }

  // Get data from Step 1
  getStep1Data() {
    return this.formData.step1;
  }

  // Get data from Step 2
  getStep2Data() {
    return this.formData.step2;
  }

  // Get all form data
  getAllFormData() {
    return this.formData;
  }
}