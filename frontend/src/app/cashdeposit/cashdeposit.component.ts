import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { OnlinePaymentService } from '../service/online-payment.service';
import { CashdepositService } from '../service/cashdeposit.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cashdeposit',
  templateUrl: './cashdeposit.component.html',
  styleUrls: ['./cashdeposit.component.css'],
  animations: [
    trigger('slideToggle', [
      state('hidden', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0',
        visibility: 'hidden'
      })),
      state('visible', style({
        height: '*',
        opacity: '1',
        visibility: 'visible'
      })),
      transition('hidden <=> visible', animate('100ms ease-in-out'))
    ])
  ]
})


export class CashdepositComponent implements OnInit{

  isVisible: boolean = false;

  showContent: boolean = false;
  showCurrencyContent: boolean = false;
  showUploadContent: boolean = false;
  uploadedDocuments: string[] = [];
  accountDetails: any[] = [];
  quoteId: string = '';

  selectedFiles: File[] = [];
  
  constructor(private onlinePaymentService: OnlinePaymentService,
    private CashdepositService: CashdepositService,
    private route: ActivatedRoute ,
    private router: Router
    ) { }

  ngOnInit(): void {
    // Call the getAccountDetails method to fetch account details
    this.onlinePaymentService.getAccountDetails().subscribe(
      (data: any[]) => {
        this.accountDetails = data;
        // console.log("sssssssssssssssssssss", this.accountDetails);
        // Do something with the fetched account details
      },
      error => {
        console.error(error);
        // Handle error
      }
    );

    this.route.params.subscribe((params: { [x: string]: string; }) => {
      this.quoteId = params['id']; // Adjust the key if it's different
      // Now you can use this.quoteId in your component
    });

  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }
  submitForm() {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      alert("Please upload a file.");
      return;
    }
    if (this.selectedFiles) {
      this.CashdepositService.sendCashDepositData(this.quoteId, this.selectedFiles).subscribe(
        response => {
          if ('message' in response) {
            console.log(response)
            this.router.navigate([`/success/${this.quoteId}`]);
          }
        },
        error => {
          console.error(error); // Handle the error
        }
      );
    } else {
      console.error("No file selected");
    }
  }


  removeFile(index: number): void {
    this.uploadedDocuments.splice(index, 1);
  }

  toggleContent() {
    this.showContent = !this.showContent;
    if (this.showContent) {
      this.showCurrencyContent = false;
      this.showUploadContent = false;
    }
  }

  toggleCurrencyContent() {
    this.showCurrencyContent = !this.showCurrencyContent;
    if (this.showCurrencyContent) {
      this.showContent = false;
      this.showUploadContent = false;
    }
  }

  toggleUploadContent() {
    this.showUploadContent = !this.showUploadContent; 
    if (this.showUploadContent) {
      this.showContent = false;
      this.showCurrencyContent = false;
    }
    // Toggle the Upload Transfer Copy content
  }


// onFileSelected(event: any) {
//   const selectedFile = event.target.files[0];
//   if (selectedFile) {
//     // Check if the number of uploaded documents is less than 2
//     if (this.uploadedDocuments.length < 2) {
//       this.uploadedDocuments.push(selectedFile.name);
//       // You can upload the file to your server or perform other actions here
//     } else {
//       // Display an error message if the limit is exceeded
//       alert("You can only upload up to 2 documents.");
//     }
//   }
// }


onFileSelected(event: any): void {
  const element = event.currentTarget as HTMLInputElement;
  const files: FileList | null = element.files;

  if (files) {
    for (let i = 0; i < files.length; i++) {
      
      // Continue processing the selected file
      this.selectedFiles.push(files[i]);
      this.uploadedDocuments.push(files[i].name);
    }
  }
}



// onFileSelected(event: any) {
//   const selectedFile = event.target.files[0];
//   if (selectedFile) {
//     // Check if the number of uploaded documents is less than 2
//     if (this.uploadedDocuments.length < 2) {
//       this.uploadedDocuments.push(selectedFile.name);
//       // Save the file in local storage
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         localStorage.setItem('Cashdepositfile', JSON.stringify({
//           name: selectedFile.name,
//           data: reader.result // File content as base64 data
//         }));
//       };
//       reader.readAsDataURL(selectedFile);
//     } else {
//       // Display an error message if the limit is exceeded
//       alert("You can only upload up to 2 documents.");
//     }
//   }
// }

uploadFile() {
  // Retrieve the uploaded file from local storage
  const uploadedFile = localStorage.getItem('uploadedFile');
  if (uploadedFile) {
    const fileData = JSON.parse(uploadedFile);
    // Perform file upload logic here, using fileData.name and fileData.data
    console.log("Uploaded File Name:", fileData.name);
    console.log("Uploaded File Content:", fileData.data);
    // Here, you can send the file data to your server using a service or HttpClient
  } else {
    console.error("No file uploaded.");
  }
}
}