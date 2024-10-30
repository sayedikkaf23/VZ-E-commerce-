import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import AOS from 'aos';

@Component({
  selector: 'app-virtual-receptionist-2',
  templateUrl: './virtual-receptionist-2.component.html',
  styleUrls: ['./virtual-receptionist-2.component.css']
})
export class VirtualReceptionist2Component implements OnInit {
  formData: FormGroup;
  shareholdersData: any[] = []; // Array to hold shareholders' initial data
  uploadedFiles: File[][] = []; // Array of arrays, where each sub-array holds files for a specific shareholder

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.formData = this.fb.group({
      companyTradeLicense: ['', Validators.required],
      shareholders: this.fb.array([]) // Array for shareholders' dynamic form fields
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    // Retrieve saved data from localStorage
    const savedData = localStorage.getItem('virtualdata1');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.shareholdersData = parsedData.shareholders || [];
      this.initializeShareholders();
    }
  }

  get shareholders(): FormArray {
    return this.formData.get('shareholders') as FormArray;
  }

  initializeShareholders(): void {
    this.shareholdersData.forEach((shareholder, index) => {
      const shareholderGroup = this.fb.group({
        name: [shareholder.name || '', Validators.required],
        shareholderPercentage: [shareholder.shareholderPercentage || '', Validators.required],
        dob: [shareholder.dob || '', Validators.required],
        nationalityshareholder: [shareholder.nationalityshareholder || '', Validators.required],
        passportNumber: [shareholder.passportNumber || '', Validators.required],
        files: [[]] // Optional: only add Validators.required if files are required
      });
  
      this.shareholders.push(shareholderGroup);
      this.uploadedFiles.push([]); // Initialize file array for each shareholder
    });
  }
  
  
  

 onFileChange(event: Event, index: number): void {
  const element = event.currentTarget as HTMLInputElement;
  const fileList: FileList | null = element.files;

  if (fileList && fileList.length > 0) {
    const newFiles = Array.from(fileList).slice(0, 4); // Limit to 4 files per shareholder

    if (!this.uploadedFiles[index]) this.uploadedFiles[index] = [];
    newFiles.forEach(newFile => {
      if (!this.uploadedFiles[index].some(file => file.name === newFile.name)) {
        this.uploadedFiles[index].push(newFile);
      }
    });
    console.log(`Files for shareholder ${index}:`, this.uploadedFiles[index]); // Log for verification
  }
}

  
  
  
  
  onSubmit(): void {
    if (this.formData.valid) {
      const formValues = this.formData.value;
  
      const dataToSave = {
        ...formValues,
        shareholders: formValues.shareholders.map((shareholder: any, index: number) => ({
          ...shareholder,
          passportNumber: this.shareholders.at(index).get('passportNumber')?.value || '',
          files: this.uploadedFiles[index]?.map(file => ({ name: file.name })) || [] // Include files array or empty if none
        }))
      };
  
      // Save data in localStorage
      localStorage.setItem('virtualdata2', JSON.stringify(dataToSave));
  
      // Navigate to the next step
      this.router.navigate(['/virtual-receptionist-details']);
    } else {
      console.log('Please fill all required fields');
      this.shareholders.controls.forEach(control => control.markAllAsTouched());
    }
  }
  
  
  
  
  
  
  
}
