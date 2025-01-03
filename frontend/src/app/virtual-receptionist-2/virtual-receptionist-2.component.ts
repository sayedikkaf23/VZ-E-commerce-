import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  // Our main form group
  formData: FormGroup;

  // We’ll load shareholders data from localStorage (virtualdata1, virtualdata2)
  shareholdersData: any[] = [];

  // For storing uploaded files & file names
  uploadedFiles: File[][] = [];
  uploadedFileNames: { [key: number]: { name: string; url: string }[] } = {};

  // For the company trade license, we store an array of { name, url }
  companyTradeLicenseFile: { name: string; url: string }[] = [];

  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private fileStorageService: FileStorageService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // IMPORTANT: formControl names must match what you will set/read in ngOnInit and onSubmit
    this.formData = this.fb.group({
      // Text input for the license number or text
      companyTradeLicense: ['', Validators.required],

      // Will store the name of the uploaded license file
      companyTradeLicenseFile: ['', Validators.required],

      // Dynamically added shareholders
      shareholders: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Scroll to top if browser environment
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    // Read localStorage
    const savedData1 = localStorage.getItem('virtualdata1');
    const savedData2 = localStorage.getItem('virtualdata2');

    let parsedData1: any = {};
    let parsedData2: any = {};

    // Parse the JSON from virtualdata1
    if (savedData1) {
      parsedData1 = JSON.parse(savedData1);
    }

    // Start with shareholders from `virtualdata1`
    this.shareholdersData = parsedData1.shareholders || [];
    this.initializeShareholders();

    // Parse the JSON from virtualdata2
    if (savedData2) {
      parsedData2 = JSON.parse(savedData2);

      // Merge any existing shareholder data (including passportNumber, name, etc.)
      if (parsedData2.shareholders) {
        this.shareholdersData.forEach((sh, i) => {
          if (parsedData2.shareholders[i]) {
            // Merge passportNumber if it exists
            if (parsedData2.shareholders[i].passportNumber) {
              sh.passportNumber = parsedData2.shareholders[i].passportNumber;
            }
            // Merge name, DOB, nationality, etc. if you wish:
            if (parsedData2.shareholders[i].name) {
              sh.name = parsedData2.shareholders[i].name;
            }
            if (parsedData2.shareholders[i].shareholderPercentage) {
              sh.shareholderPercentage = parsedData2.shareholders[i].shareholderPercentage;
            }
            if (parsedData2.shareholders[i].dob) {
              sh.dob = parsedData2.shareholders[i].dob;
            }
            if (parsedData2.shareholders[i].nationalityshareholder) {
              sh.nationalityshareholder = parsedData2.shareholders[i].nationalityshareholder;
            }
          }
        });
      }
      // Re-initialize the form array with merged data
      this.initializeShareholders();

      // Restore the company trade license text (the "number" or label) from parsedData2
      if (parsedData2.companyTradeLicense) {
        this.formData.get('companyTradeLicense')?.setValue(parsedData2.companyTradeLicense);
      }

      // Restore the uploaded license file info
      this.companyTradeLicenseFile = parsedData2.companyTradeLicenseFile || [];

      if (this.companyTradeLicenseFile.length > 0) {
        // Update the form control to show we have a license file uploaded
        this.formData.get('companyTradeLicenseFile')?.setValue(this.companyTradeLicenseFile[0].name);
      }

      // Restore the uploaded file names for shareholders
      this.uploadedFileNames = parsedData2.uploadedFileNames || {};
    }
  }

  // Helper to get the shareholders FormArray
  get shareholders(): FormArray {
    return this.formData.get('shareholders') as FormArray;
  }

  // Build the dynamic form array from shareholdersData
  initializeShareholders(): void {
    // Clear existing controls
    while (this.shareholders.length) {
      this.shareholders.removeAt(0);
    }

    // For each shareholder object, build a form group
    this.shareholdersData.forEach((shareholder, index) => {
      const shareholderGroup = this.fb.group({
        name: [shareholder.name || '', Validators.required],
        shareholderPercentage: [shareholder.shareholderPercentage || '', Validators.required],
        dob: [shareholder.dob || '', Validators.required],
        nationalityshareholder: [shareholder.nationalityshareholder || '', Validators.required],
        passportNumber: [shareholder.passportNumber || '', Validators.required],
        files: [[]] // We'll validate the presence of these files manually
      });

      this.shareholders.push(shareholderGroup);

      // Ensure our arrays for files are set up
      if (!this.uploadedFiles[index]) {
        this.uploadedFiles[index] = [];
      }
      if (!this.uploadedFileNames[index]) {
        this.uploadedFileNames[index] = [];
      }
    });
  }

  /**
   * Triggered when user selects a Trade License file
   */
  onFileChangeTrade(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file: File = event.target.files[0];

      this.isLoading = true;
      this.userService.getPresignedUrl(file).subscribe(
        (response: any) => {
          const presignedUrl = response.url;
          // Upload the file to S3
          fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file
          }).then(() => {
            // Once uploaded, store file info in our array
            this.companyTradeLicenseFile = [{ name: file.name, url: presignedUrl }];

            // Update the form control for "companyTradeLicenseFile"
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

  /**
   * Triggered when user selects shareholder files
   */
  onFileChange(event: any, index: number): void {
    if (event.target.files && event.target.files.length > 0) {
      // Convert to an Array
      const filesArray: File[] = Array.from(event.target.files as FileList);

      this.uploadedFiles[index] = filesArray;
      this.uploadedFileNames[index] = [];

      this.isLoading = true;

      // Upload each file with presigned URL
      const uploadPromises = filesArray.map(file =>
        this.userService.getPresignedUrl(file).toPromise().then((response: any) => {
          const presignedUrl = response.url;
          return fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          })
            .then(() => {
              // Once uploaded, push the file info
              this.uploadedFileNames[index].push({ name: file.name, url: presignedUrl });
            });
        })
      );

      // Wait for all files to finish uploading
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

  /**
   * Called when user clicks the "Next" or "Submit" button
   */
  onSubmit(): void {
    // Mark all fields as touched so errors appear if any
    this.formData.markAllAsTouched();
    this.shareholders.controls.forEach(control => control.markAllAsTouched());

    // 1) Validate the "files" for each shareholder
    this.shareholders.controls.forEach((control, i) => {
      const filesFormControl = control.get('files');
      // If the user hasn't uploaded any files for this shareholder, mark it as error
      if (!this.uploadedFileNames[i] || this.uploadedFileNames[i].length === 0) {
        filesFormControl?.setErrors({ required: true });
      } else {
        filesFormControl?.setErrors(null);
      }
    });

    // 2) Validate the Trade License file
    const tradeLicenseControl = this.formData.get('companyTradeLicenseFile');
    if (!this.companyTradeLicenseFile || this.companyTradeLicenseFile.length === 0) {
      tradeLicenseControl?.setErrors({ required: true });
    } else {
      tradeLicenseControl?.setErrors(null);
    }

    // If everything is valid, proceed
    if (this.formData.valid) {
      const formValues = this.formData.value;

      // Build an object to store in localStorage
      const dataToSave = {
        ...formValues,  // includes { companyTradeLicense, companyTradeLicenseFile, shareholders }
        companyTradeLicenseFile: this.companyTradeLicenseFile,
        shareholders: formValues.shareholders.map((shareholder: any, idx: number) => ({
          ...shareholder,
          // Overwrite 'files' with the actual S3 URLs
          files: this.uploadedFileNames[idx] || []
        })),
        uploadedFileNames: this.uploadedFileNames
      };

      // Save to localStorage for retrieval later
      localStorage.setItem('virtualdata2', JSON.stringify(dataToSave));

      // Navigate to the next page
      this.router.navigate(['/virtual-receptionist-details']);
    } else {
      console.log('Please fill all required fields');
      // Optionally log the form to see which control is invalid:
      // console.log(this.formData);
    }
  }

  /**
   * For the "Browse" button of Trade License
   */
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * For each shareholder's "Browse" button
   */
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
