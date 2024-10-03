
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormDataService {
  private formData: any = {
    step1: {},
    step2: {},
  };

  // Store data from Step 1
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