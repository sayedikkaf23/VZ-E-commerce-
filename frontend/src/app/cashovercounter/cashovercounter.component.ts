import { Component, OnInit } from '@angular/core';
import { OnlinePaymentService } from '../service/online-payment.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CashovercounterService } from '../service/cashovercounter.service';

@Component({
  selector: 'app-cashovercounter',
  templateUrl: './cashovercounter.component.html',
  styleUrls: ['./cashovercounter.component.css'],
})
export class CashovercounterComponent implements OnInit {
  isFileUploaded = false;
  piData: any;
  orderId: string = '';
  selectedFiles: File[] = [];
  uploadedDocuments: string[] = [];
  uploadedInputId: string | null = null; // Change this line

  constructor(
    private onlinePaymentService: OnlinePaymentService,
    private cashovercounterService: CashovercounterService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.orderId = params['id'];
      // console.log('Order ID:', this.orderId);

      // Fetch Pi Data based on orderId
      this.fetchPiData(this.orderId);
    });
  }

  submitForm(a:number) {
    if (a === 2 && (!this.selectedFiles || this.selectedFiles.length === 0)) {
      alert("Please upload any one of the following documents:");
      return;
    }
   const formData = new FormData();

 this.selectedFiles.forEach((file) => {
   formData.append('transfer_copy', file, file.name);
 });

  this.cashovercounterService.sendCashCounterData(this.orderId, formData).subscribe(
      (response: any) => {
        if (response) {
          // console.log('Response:', response);
          if (response.message === "Cash Over Counter Transfer processed successfully") {
            // console.log('OrderId:', this.orderId);
            this.router.navigate([`/success/${this.orderId}`]);
          } else if(response.message === "Cash Over Counter Transfer processed") {
            this.router.navigate([`/cashcountersuccess/${this.orderId}`]);
            
          }
        } else {
          console.error('No response received from the server.');
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  fetchPiData(quoteId: string): void {
    this.onlinePaymentService.getPiDataById(quoteId).subscribe(
      (response) => {
        // console.log('Fetched Pi Data:', response);
        this.piData = response;
      },
      (error) => {
        console.error('Error fetching Pi Data:', error);
      }
    );
  }

  isTotalIncludingVATGreaterThan25300(): boolean {
    return this.piData && this.piData.salesforceResponseMatchScreening.total_including_Vat > 55000;
  }

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
  

  removeFile(index: number): void {
    this.uploadedDocuments.splice(index, 1);
  }

  uploadFile() {
    // Retrieve the uploaded file from local storage
    const uploadedFile = localStorage.getItem('uploadedFile');
    if (uploadedFile) {
      const fileData = JSON.parse(uploadedFile);
      // Perform file upload logic here, using fileData.name and fileData.data
      // console.log("Uploaded File Name:", fileData.name);
      // console.log("Uploaded File Content:", fileData.data);
      // Here, you can send the file data to your server using a service or HttpClient
    } else {
      console.error("No file uploaded.");
    }
  }
  
}