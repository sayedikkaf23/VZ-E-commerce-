import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import AOS from 'aos';
import { UserService } from '../service/user.service';
import { FileStorageService } from '../service/files.service';

@Component({
  selector: 'app-virtual-receptionist-2',
  templateUrl: './virtual-receptionist-2.component.html',
  styleUrls: ['./virtual-receptionist-2.component.css']
})
export class VirtualReceptionist2Component implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChildren('fileInput2') fileInputs!: QueryList<ElementRef>;

  formData: FormGroup;
  shareholdersData: any[] = [];
  uploadedFiles: File[][] = [];
  uploadedFileNames: { [key: string]: { name: string; url: string }[] } = {};
  
  // We'll store the trade license file info as { name: string, url: string }[] for serialization
  companyTradeLicenseFile: { name: string; url: string }[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private fileStorageService: FileStorageService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Define both controls for company trade license text and file upload
    this.formData = this.fb.group({
      companyTradeLicense: ['', Validators.required],
      companyTradeLicenseFile: ['', Validators.required],
      shareholders: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    const savedData1 = localStorage.getItem('virtualdata1');
    const savedData2 = localStorage.getItem('virtualdata2');
    const savedData = savedData2 || savedData1;

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.shareholdersData = parsedData.shareholders || [];
      this.initializeShareholders();

      // Restore text-based trade license if previously saved
      if (parsedData.companyTradeLicense) {
        this.formData.get('companyTradeLicense')?.setValue(parsedData.companyTradeLicense);
      }

      // Restore trade license file info if previously saved
      this.companyTradeLicenseFile = parsedData.companyTradeLicenseFile || [];
      if (this.companyTradeLicenseFile.length > 0) {
        // Set the form control for the file name
        this.formData.get('companyTradeLicenseFile')?.setValue(this.companyTradeLicenseFile[0].name);
      }

      // Restore uploaded file names
      this.uploadedFileNames = parsedData.uploadedFileNames || {};
    } else {
      this.initializeShareholders();
    }
  }
  
  get shareholders(): FormArray {
    return this.formData.get('shareholders') as FormArray;
  }

  initializeShareholders(): void {
    while (this.shareholders.length) {
      this.shareholders.removeAt(0);
    }

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
      this.isLoading = true;
      this.userService.getPresignedUrl(file).subscribe(
        (response: any) => {
          const presignedUrl = response.url;
          fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file
          }).then(() => {
            // Store file info as { name, url }
            this.companyTradeLicenseFile = [{ name: file.name, url: presignedUrl }];

            // Set the form control for the file name
            this.formData.get('companyTradeLicenseFile')?.setValue(file.name);

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
      const uploadPromises = filesArray.map(file =>
        this.userService.getPresignedUrl(file).toPromise().then((response: any) => {
          const presignedUrl = response.url;
          return fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          })
          .then(() => {
            this.uploadedFileNames[index].push({ name: file.name, url: presignedUrl });
          });
        })
      );

      Promise.all(uploadPromises)
        .then(() => {
          console.log(`All files for Shareholder ${index + 1} uploaded successfully`);
          this.isLoading = false;
        })
        .catch(error => {
          console.error(`Error uploading files for Shareholder ${index + 1}`, error);
          this.isLoading = false;
        });
    }
  }

  onSubmit(): void {
    this.formData.markAllAsTouched();
    this.shareholders.controls.forEach(control => control.markAllAsTouched());

    if (this.formData.valid) {
      const formValues = this.formData.value;
      const dataToSave = {
        ...formValues,
        companyTradeLicenseFile: this.companyTradeLicenseFile,
        shareholders: formValues.shareholders.map((shareholder: any, index: number) => ({
          ...shareholder,
          files: this.uploadedFileNames[index] || []
        })),
        uploadedFileNames: this.uploadedFileNames
      };

      localStorage.setItem('virtualdata2', JSON.stringify(dataToSave));
      this.router.navigate(['/virtual-receptionist-details']);
    } else {
      console.log('Please fill all required fields');
    }
  }

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  triggerFileUpload2(index: number): void {
    const fileInputArray = this.fileInputs.toArray();
    const fileInput = fileInputArray[index];
    if (fileInput) {
      fileInput.nativeElement.click();
    } else {
      console.error(`No file input found for index ${index}`);
    }
  }
}
