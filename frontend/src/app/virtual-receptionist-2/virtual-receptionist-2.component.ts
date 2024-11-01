import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import AOS from 'aos';
import { FileStorageService } from '../service/files.service';
@Component({
  selector: 'app-virtual-receptionist-2',
  templateUrl: './virtual-receptionist-2.component.html',
  styleUrls: ['./virtual-receptionist-2.component.css']
})
export class VirtualReceptionist2Component implements OnInit {
  formData: FormGroup;
  shareholdersData: any[] = [];
  uploadedFiles: File[][] = []; // Array for each shareholder's files
  uploadedFileNames: { [key: string]: string } = {};
  totalFileSize = 0;
  fileData: FormData = new FormData();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private fileStorageService: FileStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.formData = this.fb.group({
      companyTradeLicense: ['', Validators.required],
      shareholders: this.fb.array([])
    });
  }
  ngOnInit(): void {
    console.log('ngOnInit executed');
  
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
  
    // Retrieve saved data from localStorage for both keys
    const savedData1 = localStorage.getItem('virtualdata1');
    const savedData2 = localStorage.getItem('virtualdata2');
  
    // Use savedData2 if available, otherwise fall back to savedData1
    const savedData = savedData2 || savedData1;
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.shareholdersData = parsedData.shareholders || [];
      this.initializeShareholders();
  
      // Repopulate form fields with saved data
      this.formData.patchValue({
        companyTradeLicense: parsedData.companyTradeLicense || '',
        shareholders: this.shareholdersData
      });
  
      // Restore file names and populate uploadedFiles
      this.shareholdersData.forEach((shareholder: any, index: number) => {
        const savedFiles = shareholder.files || [];
        // Convert saved file names back to a simple representation in uploadedFiles
        this.uploadedFiles[index] = savedFiles.map((file: any) => ({
          name: file.name
        }));
        console.log(`Restored file names for Shareholder ${index + 1}:`, this.uploadedFiles[index]);
      });
  
      console.log("Saved Data from localStorage:", savedData);
      console.log("Parsed Shareholders Data:", this.shareholdersData);
      console.log("Form Data after Initialization:", this.formData.value);
    } else {
      console.log("No savedData found in localStorage.");
      this.initializeShareholders(); // Initialize empty form if no saved data exists
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
        files: [[]]
      });
  
      this.shareholders.push(shareholderGroup);
      this.uploadedFiles.push([]); // Initialize file array for each shareholder
    });
  }
  
  onFileChange(event: any, index: number): void {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray: File[] = Array.from(event.target.files as FileList);
      this.fileStorageService.setFiles(index, filesArray);
      this.uploadedFiles[index] = filesArray; // Keep track of files in the component as well
      console.log(`Files stored in service for Shareholder ${index + 1}:`, filesArray);
    }
  }
  
  onSubmit(): void {
    // Mark all form controls as touched to trigger validation messages
    this.formData.markAllAsTouched();
    this.shareholders.controls.forEach(control => control.markAllAsTouched());
  
    if (this.formData.valid) {
      const formValues = this.formData.value;
  
      const dataToSave = {
        ...formValues,
        shareholders: formValues.shareholders.map((shareholder: any, index: number) => ({
          ...shareholder,
          passportNumber: this.shareholders.at(index).get('passportNumber')?.value || '',
          files: this.uploadedFiles[index]?.map(file => ({ name: file.name })) || []
        }))
      };
  
      // Convert dataToSave to JSON and save in localStorage for persistence
      localStorage.setItem('virtualdata2', JSON.stringify(dataToSave));
  
      // Navigate to the next step
      this.router.navigate(['/virtual-receptionist-details']);
    } else {
      // Log a message if the form is invalid
      console.log('Please fill all required fields');
    }
  }
  
}
