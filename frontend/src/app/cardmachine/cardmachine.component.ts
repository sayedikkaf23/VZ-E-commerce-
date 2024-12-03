import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { OnlinePaymentService } from '../service/online-payment.service';
import { CardmachineService } from '../service/cardmachine.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cardmachine',
  templateUrl: './cardmachine.component.html',
  styleUrls: ['./cardmachine.component.css'],
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
export class CardmachineComponent implements OnInit {
  showContent: boolean = false;
  showCurrencyContent: boolean = false;
  accountDetails: any[] = [];
  quoteId: string = '';
  showUploadContent: boolean = false;
  selectedFile: File | null = null; // Allow null as an initial value
  uploadedDocuments: string[] = [];
  
  constructor(private onlinePaymentService: OnlinePaymentService,
    private CashMechinService: CardmachineService,
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




//   submitForm(a:number) {
//     console.log(a)
//    if (a === 2 && this.selectedFiles.length == 1) {
//      alert("Please upload exactly 3 file.");
//      return;
//    }
//    const formData = new FormData();

//  this.selectedFiles.forEach((file) => {
//    formData.append('transfer_copy', file, file.name);
//  });

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

  goBack() {
    // Navigate back using the router
    this.router.navigate([`/onlinepayment/${this.quoteId}`]);
  }
  
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const selectedFile = event.target.files[0]; // Define selectedFile here
      this.uploadedDocuments.push(selectedFile.name); // Now you can access selectedFile.name
      this.selectedFile = selectedFile; // Assign selectedFile to your component property
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
  //         localStorage.setItem('cardmachine', JSON.stringify({
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
  function toggleContent() {
    throw new Error('Function not implemented.');
  }

