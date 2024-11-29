import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import AOS from 'aos';
import { UserService } from '../service/user.service';
import { FileStorageService } from '../service/files.service';

declare var $: any;

@Component({
  selector: 'app-mails-management-3',
  templateUrl: './mails-management-3.component.html',
  styleUrl: './mails-management-3.component.css'
})
export class MailsManagement3Component {
  formData: FormGroup;
  shareholdersData: any[] = [];
  uploadedFiles: File[][] = [];
  uploadedFileNames: { [key: string]: { name: string; url: string }[] } = {};
  companyTradeLicenseFile: File[] = []; // Store the uploaded company trade license file
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private fileStorageService: FileStorageService,
    private userService: UserService,
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
  
    // Retrieve saved data from localStorage
    const savedData1 = localStorage.getItem('mailform1');
    const savedData2 = localStorage.getItem('mailform2');
    const savedData = savedData2 || savedData1;

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.shareholdersData = parsedData.shareholders || [];
      this.initializeShareholders();

      // Repopulate form fields with saved data
      this.formData.patchValue({
        companyTradeLicense: parsedData.companyTradeLicense || '',
        companyTradeLicenseFile: parsedData.companyTradeLicenseFile || null,
        shareholders: this.shareholdersData
      });

      // Restore file URLs for each shareholder
      this.uploadedFileNames = parsedData.uploadedFileNames || {};
      this.companyTradeLicenseFile = parsedData.companyTradeLicenseFile || []; // Restore company trade license file
      console.log("Restored file URLs:", this.uploadedFileNames);
    } else {
      console.log("No savedData found in localStorage.");
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
        files: [[]]
      });

      this.shareholders.push(shareholderGroup);
      this.uploadedFiles.push([]);
    });
  }

  onFileChangeTrade(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file: File = event.target.files[0];
      this.companyTradeLicenseFile = [file]; // Store the uploaded file for company trade license
      
      this.isLoading = true;
      this.userService.getPresignedUrl(file).subscribe(
        (response: any) => {
          const presignedUrl = response.url;
          fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file
          }).then(() => {
            // Save the file details (name and URL)
            this.uploadedFileNames['companyTradeLicenseFile'] = [{ name: file.name, url: presignedUrl }];
            this.isLoading = false;
          }).catch((error) => {
            console.error('File upload failed', error);
            this.isLoading = false;
          });
        },
        (error) => {
          console.error('Error getting presigned URL', error);
          this.isLoading = false;
        }
      );
    }
  }

  onFileChange(event: any, index: number): void {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray: File[] = Array.from(event.target.files as FileList);
      this.uploadedFiles[index] = filesArray;
      this.uploadedFileNames[index] = [];

      this.isLoading = true;

      filesArray.forEach((file) => {
        this.userService.getPresignedUrl(file).subscribe(
          (response: any) => {
            const presignedUrl = response.url;

            fetch(presignedUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': file.type,
              },
              body: file,
            })
              .then(() => {
                console.log(`File uploaded successfully: ${file.name}`);
                this.uploadedFileNames[index].push({ name: file.name, url: presignedUrl });
                this.isLoading = false;
              })
              .catch((error) => {
                this.isLoading = false;

                console.error(`Error uploading file: ${file.name}`, error);
              })
              .finally(() => {
                this.isLoading = false;
              });
          },
          (error: any) => {
            this.isLoading = false;
            console.error('Error getting pre-signed URL', error);
          }
        );
      });
      console.log(`Files stored for Shareholder ${index + 1}:`, filesArray);
    }
  }

  onSubmit(): void {
    this.formData.markAllAsTouched();
    this.shareholders.controls.forEach(control => control.markAllAsTouched());
  
    if (this.formData.valid) {
      const formValues = this.formData.value;

      const dataToSave = {
        ...formValues,
        companyTradeLicenseFile: this.companyTradeLicenseFile, // Save company trade license file
        shareholders: formValues.shareholders.map((shareholder: any, index: number) => ({
          ...shareholder,
          passportNumber: this.shareholders.at(index).get('passportNumber')?.value || '',
          files: this.uploadedFileNames[index] || []
        })),
        uploadedFileNames: this.uploadedFileNames // Persist the uploaded file URLs
      };

      localStorage.setItem('mailform2', JSON.stringify(dataToSave));
  
      // Navigate to the next step
      this.router.navigate(['/mails-management-details']);
    } else {
      console.log('Please fill all required fields');
    }
  }
}
