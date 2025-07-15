import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { FileStorageService } from '../service/files.service';
import { ToastrService } from 'ngx-toastr';
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

  // We’ll load shareholders data from sessionStorage (virtualdata1, virtualdata2)
  shareholdersData: any[] = [];
  economicDetailId: any;
  // For storing uploaded files & file names
  uploadedFiles: File[][] = [];
  uploadedFileNames: { [key: number]: { name: string; url: string; type: string;}[] } = {};

  // For the company trade license, we store an array of { name, url }
  companyTradeLicenseFile: { name: string; url: string; type: string;}[] = [];
  personalInfo: any;
  leadResponse: any;
  isLoading = false;
 tradeLicenseFile: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private fileStorageService: FileStorageService,
    private userService: UserService,
    private toastr: ToastrService,
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

     const leadDataRaw = sessionStorage.getItem('leadResponse');
  const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;
  const leadId = leadData?.LeadId;

  if (leadId) {
    this.isLoading = true;
    this.userService.getStep1(leadId).subscribe({
      next: (storedData) => {
        this.isLoading = false;
        this.personalInfo = storedData; 
        
         this.userService.getTradeLicenseAndShareholders(leadId).subscribe({
            next: (tradeData: any) => {
              this.tradeLicenseFile = tradeData || {};
console.log("Trade License Data:", tradeData);
             this.tradeLicenseFile = tradeData || {};
            console.log("Trade License Data:", tradeData);

            this.shareholdersData = tradeData.shareholders || [];
            console.log("Shareholders Data:", this.shareholdersData);

            //  Initialize form array now, after shareholders data is ready
            this.initializeShareholders();
              //  Update other fields in the formData if needed
            if (tradeData.companyTradeLicenseNumber) {
              this.formData.get('companyTradeLicenseNumber')?.setValue(tradeData.TradeLicenseNumber);
            }
              if (Array.isArray(tradeData.companyTradeLicenseFile) && tradeData.companyTradeLicenseFile.length > 0) {
              this.companyTradeLicenseFile = tradeData.tradeLicenseFileURL;
              this.formData.get('companyTradeLicenseFileName')?.setValue(tradeData.companyTradeLicenseFile[0].name);
            }
            this.uploadedFileNames = tradeData.uploadedFileNames || {};

            },
            error: (err:any) => {
              console.error('Failed to load trade license data:', err);
              this.toastr.error('Could not load trade license data.', 'Error');
            }
          });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load step1 & step2 data', err);
      }
    });
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
 // Check if file is greater than 2 MB (2 MB = 2,097,152 bytes)
    if (file.size > 2097152) {
      this.toastr.error('File size should be below 2 MB', 'File Too Large');
      event.target.value = null;
      return; // Skip uploading this file
    }
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
            this.companyTradeLicenseFile = [{ name: file.name, url: presignedUrl, type: "Trade License" }];

            // Update the form control for "companyTradeLicenseFile"
            this.formData.get('companyTradeLicenseFile')?.setValue(file.name);

            this.isLoading = false;
          }).catch((error) => {
            console.error('File upload failed', error);
            this.toastr.error(error.message || 'Failed to upload file');
            this.isLoading = false;
          });
        },
        (error) => {
          console.error('Error getting presigned URL', error);
          // console.error('Error getting presigned URL:', error);

          // Angular’s HttpClient typically puts the server’s JSON under error.error
          // e.g., error.error = { error: "File size cannot exceed 1MB" }
          // const errorMsg = error.error?.error || 'An error occurred while getting URL';
  
          // // Show it in a toast (using ngx-toastr for example)
          // this.toastr.error(errorMsg, 'Error');
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
      this.uploadedFiles[index] = [];
      this.uploadedFileNames[index] = [];
// Check if file is greater than 2 MB (2 MB = 2,097,152 bytes)
     let filesToUpload: File[] = [];

   
    for (const file of filesArray) { // Iterate through each file selected in this event
      if (file.size > 2097152) { // Check the size of the current 'file' in the loop
        this.toastr.error(`File "${file.name}" size should be below 2 MB`, 'File Too Large');
        // Do not add this file to filesToUpload, but allow others
      } else {
        filesToUpload.push(file);
      }
    }
   

    if (filesToUpload.length === 0) {
      event.target.value = null; // Clear the file input if all were too large
      return;
    }

    this.uploadedFiles[index] = filesToUpload; // Store only the valid files

      this.isLoading = true;

      // Upload each file with presigned URL
      const uploadPromises = filesToUpload.map(file =>
        this.userService.getPresignedUrl(file).toPromise().then((response: any) => {
          const presignedUrl = response.url;
          return fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          })
            .then(() => {
              // Once uploaded, push the file info
              this.uploadedFileNames[index].push({ name: file.name, url: presignedUrl, type: " Shareholder docs" });
            });
        })
      );

      // Wait for all files to finish uploading
      Promise.all(uploadPromises)
        .then(() => {
          // console.log(`All files for Shareholder ${index + 1} uploaded successfully`);
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

      this.economicDetailId = sessionStorage.getItem('economicDetailId');

    //check for economicDetailId
    if(!this.economicDetailId){
       alert("economicDetailId not found");
        this.router.navigate(['/mails-management']);
    }

    // If everything is valid, proceed
    if (this.formData.valid) {
      const formValues = this.formData.value;

      // Build an object to store in sessionStorage
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
       

         const leadResponseRaw = sessionStorage.getItem('leadResponse');
        this.leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};

    
  
         // payload for salesforce api
        const insertPayload = {
            leadId: this.leadResponse.LeadId,
            accountId: this.leadResponse.AccountId,
            serviceName: 'Virtual Receptionist',
            // subServiceName: '',
           firstName: this.personalInfo.FirstName,
            lastName: this.personalInfo.LastName,
            email: this.personalInfo.Email,
            nationality: this.personalInfo.Nationality,
            phone: this.personalInfo.Phone,
            dob: this.personalInfo.dob,
            // companyLocationUAE: '',
            // employmentType: '',
             companyName: this.personalInfo.Company,
            // salary: '',
            // bankType: '',
             companyLicensed: this.personalInfo.companyLicensed,
            activityType: this.personalInfo.activityType,
           totalShareholders: this.personalInfo.totalShareholders ,
             economicDetailId: this.economicDetailId,
             countryCode: this.personalInfo.countryCode,
            // companyTurnover: '',
            companyLocation: this.personalInfo.companyLocation,
            companyWebsite: this.personalInfo.companyWebsite,
            tradeLicenseNo: formValues.companyTradeLicense,
            shareholderfilesnumber: formValues.shareholders?.[0]?.passportNumber || '',
            tradeLicenseFile: this.companyTradeLicenseFile?.[0]?.url || '',
            shareholdersfiles: Object.values(this.uploadedFileNames || {})
            .flat()
            .map((f: any) => f.url)
            .filter(Boolean)[0] || '',
            shareholders: this.shareholders.value.map((shareholder: any, idx: number) => ({
              ...shareholder,
              files: this.uploadedFileNames[idx] || []
            })),

          };
            console.log(insertPayload);
           this.isLoading = true;
          this.userService.insertEconomicDetails(insertPayload).subscribe(
          (response) => {
            console.log('API Response:', response);
            this.isLoading = false;
             // Save to sessionStorage for retrieval later
      sessionStorage.setItem('virtualdata2', JSON.stringify(dataToSave));

      // Navigate to the next page
      this.router.navigate(['/virtual-receptionist-details']);
          }
          );

     
    } else {
      // console.log('Please fill all required fields');
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
     const fileInput = this.fileInputs.toArray()[index];
    if (fileInput) {
      fileInput.nativeElement.click();
    } else {
      console.error(`No file input found for index ${index}`);
    }
  }
}
