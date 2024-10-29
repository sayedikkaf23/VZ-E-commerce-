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
  uploadedFiles: File[][] = []; // Array of arrays to hold uploaded files for each shareholder

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
      // Create a new FormGroup for each shareholder
      const shareholderGroup = this.fb.group({
        name: [shareholder.name, Validators.required],
        shareholderPercentage: [shareholder.shareholderPercentage, Validators.required],
        dob: [shareholder.dob, Validators.required],
        nationalityshareholder: [shareholder.nationalityshareholder, Validators.required],
        passportNumber: ['', Validators.required], // New field for passport number
        files: [[], Validators.required] // New field for file uploads
      });
      this.shareholders.push(shareholderGroup);
      this.uploadedFiles.push([]); // Initialize file array for each shareholder
    });
  }

  onFileChange(event: Event, index: number): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      // Append new files, up to 4 unique files per shareholder
      const newFiles = Array.from(fileList).slice(0, 4);

      // Avoid duplicates
      newFiles.forEach(newFile => {
        if (!this.uploadedFiles[index].some(file => file.name === newFile.name)) {
          this.uploadedFiles[index].push(newFile);
        }
      });

      // Limit files to 4 per shareholder
      if (this.uploadedFiles[index].length > 4) {
        this.uploadedFiles[index] = this.uploadedFiles[index].slice(0, 4);
      }

      // Update the form control with file names for this specific shareholder
      this.shareholders.at(index).patchValue({ files: this.uploadedFiles[index].map(file => file.name) });
    }
  }

  onSubmit(): void {
    if (this.formData.valid) {
      const formValues = this.formData.value;

      // Save form data and uploaded file names to local storage
      const dataToSave = {
        ...formValues,
        uploadedFiles: this.uploadedFiles.map(files => files.map(file => ({ name: file.name })))
      };
      localStorage.setItem('virtualdata2', JSON.stringify(dataToSave));

      console.log('Form Data:', formValues);  // Debugging: Display form data in console

      // Navigate to the next page
      this.router.navigate(['/virtual-receptionist-details']);
    } else {
      console.log('Please fill all required fields');
    }
  }
}
