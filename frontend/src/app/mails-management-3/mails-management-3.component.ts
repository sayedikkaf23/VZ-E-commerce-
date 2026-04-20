import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import AOS from 'aos';
import { UserService } from '../service/user.service';
import { FileStorageService } from '../service/files.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-mails-management-3',
  templateUrl: './mails-management-3.component.html',
  styleUrls: ['./mails-management-3.component.css']
})
export class MailsManagement3Component implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChildren('fileInput2') fileInputs!: QueryList<ElementRef>;

  formData: FormGroup;
  shareholdersData: any[] = [];
  uploadedFiles: File[][] = [];
  uploadedFileNames: { [key: string]: { name: string; url: string; type: string; }[] } = {};

  // Instead of File[], we'll store the trade license file info as { name: string; url: string }[]
  companyTradeLicenseFile: { name: string; url: string, type: string }[] = [];
  personalInfo: any;
  leadResponse: any;
  isLoading = false;
  economicDetailId: any;
  tradeLicenseFile: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private fileStorageService: FileStorageService,
    private userService: UserService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.formData = this.fb.group({
      companyTradeLicenseNumber: ['', Validators.required],  // Text input for the license number
      companyTradeLicenseFileName: ['', Validators.required], // File upload field for the file name
      shareholders: this.fb.array([])
    });
  }

  ngOnInit(): void {
    
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
        
         // Fetch trade license & shareholder details
      this.loadTradeLicenseAndShareholders(leadId);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load step1 & step2 data', err);
      }
    });
  }
  }

    private loadTradeLicenseAndShareholders(leadId: string): void {
      this.isLoading = true;

      this.userService.getTradeLicenseAndShareholders(leadId).subscribe({
        next: (tradeData: any) => {
          this.isLoading = false;
          console.log('Trade License Data:', tradeData);

            this.tradeLicenseFile = tradeData.tradeLicenseFile || {};
      this.shareholdersData = tradeData.shareholders || [];
      // You’d need to map per shareholder
this.uploadedFileNames = (tradeData.shareholders || []).map((s: any) => s.files || []);


      // Auto-fill trade license number if available
      if (tradeData.tradeLicenseNo) {
        this.formData.get('companyTradeLicenseNumber')?.setValue(tradeData.tradeLicenseNo);
      }

      // Auto-fill uploaded trade license file name & URL
      if (Array.isArray(tradeData.tradeLicenseFile) && tradeData.tradeLicenseFile.length > 0) {
        this.companyTradeLicenseFile = tradeData.tradeLicenseFile || [];
        this.formData.get('companyTradeLicenseFileName')?.setValue(tradeData.tradeLicenseFile[0].name);
      }

          // Initialize shareholders form array
          this.initializeShareholders();
        },
        error: err => {
          this.isLoading = false;
          console.error('Failed to load trade license and shareholder data:', err);
          this.toastr.error('Could not load trade license or shareholder details.', 'Error');
        }
      });
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
      if (!this.uploadedFiles[index]) {
        this.uploadedFiles[index] = [];
      }
    });
  }

  onFileChangeTrade(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file: File = event.target.files[0];

        // Check if file is greater than 2 MB (2 MB = 2,097,152 bytes)
    if (file.size > 2097152) {
      this.toastr.error(`File "${file.name}" size should be below 2 MB`, 'File Too Large');
      event.target.value = null;
      return; // Skip uploading this file
    }
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
            this.companyTradeLicenseFile = [{ name: file.name, url: presignedUrl , type:'Trade License' }];
            // Update the form control for the file name
            this.formData.get('companyTradeLicenseFileName')?.setValue(file.name);
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

  onFileChange(event: any, index: number): void {
    if (event.target.files && event.target.files.length > 0) {
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
  
      const uploadPromises = filesToUpload.map(file =>
        this.userService.getPresignedUrl(file).toPromise().then((response: any) => {
          const presignedUrl = response.url;
          return fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          }).then(() => {
            this.uploadedFileNames[index].push({
              name: file.name,
              type: 'Shareholder docs',
              url: presignedUrl
            });
          });
        })
      );
  
      Promise.all(uploadPromises)
        .then(() => {
          this.isLoading = false;
        })
        .catch(error => {
          console.error(`Error uploading files for Shareholder ${index + 1}`, error);
          this.isLoading = false;
        });
    }
  }
  

  onSubmit(): void {
    // Mark the entire form and each shareholder as touched
    this.formData.markAllAsTouched();
    this.shareholders.controls.forEach(control => control.markAllAsTouched());
  
    // 1) Validate the "files" for each shareholder
    this.shareholders.controls.forEach((control, i) => {
      const filesFormControl = control.get('files');
      // Check if this.uploadedFileNames[i] exists and is non-empty
      if (!this.uploadedFileNames[i] || this.uploadedFileNames[i].length === 0) {
        // If empty, manually set an error
        filesFormControl?.setErrors({ required: true });
      } else {
        // Remove errors if files exist
        filesFormControl?.setErrors(null);
      }
    });
  
    // 2) Validate the Trade License file
    //    (i.e., ensure at least one file is uploaded)
    const tradeLicenseControl = this.formData.get('companyTradeLicenseFileName');
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
  
    // Now proceed if form is valid
    if (this.formData.valid) {
      const formValues = this.formData.value;
  
      const dataToSave = {
        ...formValues,
        // Store the trade license file info (already as { name, url } object)
        companyTradeLicenseFile: this.companyTradeLicenseFile,
  
        // Map shareholders to include their uploaded file info
        shareholders: formValues.shareholders.map((shareholder: any, index: number) => ({
          ...shareholder,
          files: this.uploadedFileNames[index] || []
        })),
  
        // Keep track of all uploaded file names
        uploadedFileNames: this.uploadedFileNames
      };

        // const mailform = localStorage.getItem('mailform');
        // this.personalInfo = mailform ? JSON.parse(mailform) : {};

         const leadResponseRaw = sessionStorage.getItem('leadResponse');
        this.leadResponse = leadResponseRaw ? JSON.parse(leadResponseRaw) : {};

    //  const mailform2 = localStorage.getItem('mailform1');
    //     const mail2 = mailform2 ? JSON.parse(mailform2) : {};
  
         // payload for salesforce api
        const insertPayload = {
            leadId: this.leadResponse.LeadId,
            accountId: this.leadResponse.AccountId,
            serviceName: 'Mail Management',
            // subServiceName: '',
            firstName: this.personalInfo?.FirstName,
            lastName: this.personalInfo?.LastName,
            email: this.personalInfo?.Email,
            nationality: this.personalInfo?.Nationality,
            phone: this.personalInfo?.Phone,
            dob: this.personalInfo?.dob,
            economicDetailId: this.economicDetailId,
            countryCode: this.personalInfo?.countryCode,
            // companyLocationUAE: '',
            // employmentType: '',
            companyName: this.personalInfo.Company,
            // salary: '',
            // bankType: '',
            companyLicensed: this.personalInfo.companyLicensed,
            activityType: this.personalInfo.activityType,
           totalShareholders: this.personalInfo.totalShareholders ,
            // companyTurnover: '',
            companyLocation: this.personalInfo.companyLocation,
            companyWebsite: this.personalInfo.companyWebsite,
            tradeLicenseNo: formValues.companyTradeLicenseNumber,
            shareholderfilesnumber: formValues.shareholders?.[0]?.passportNumber || '',
            tradeLicenseFileUrl: this.companyTradeLicenseFile?.[0]?.url || '',
            uploadedFileNames: Object.values(this.uploadedFileNames).flat(),
            tradeLicenseFile: this.companyTradeLicenseFile,
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
         
            this.router.navigate(['/mails-management-details']);
          }
          );
    
      
    } else {
      // console.log('Please fill all required fields');
      // You can also log the form to see exactly which control is invalid
      // console.log('Form Controls', this.formData.controls);
    }
  }
  

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  triggerFileUpload2(index: number): void {
    const fileInput = this.fileInputs.toArray()[index];
    if (fileInput) {
      fileInput.nativeElement.click();
    } else {
      console.error(`No file input found for index ${index}`);
    }
  }
}
