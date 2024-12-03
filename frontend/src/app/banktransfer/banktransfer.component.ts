import { Component, AfterViewInit, ViewChild, ElementRef,OnInit } from '@angular/core';
// import { trigger, state, style, transition, animate } from '@angular/animations';
import { OnlinePaymentService } from '../service/online-payment.service';
import { BankTransferService } from '../service/banktransfer.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component'; // Replace with the correct path to your app-sidebar component

// import { Component,  } from '@angular/core';

@Component({
  selector: 'app-banktransfer',
  templateUrl: './banktransfer.component.html',
  styleUrls: ['./banktransfer.component.css'],

})
export class BanktransferComponent implements OnInit {
  @ViewChild('sidebarComponent') sidebar: SidebarComponent | undefined; // Use the template reference variable
  defaultValue: number = 10;
  piData: any;
  selectedCurrency: string = ''; 
  selectedToCurrency: string = 'USD'; 
  currencies: string[] = ['AED', 'EUR', 'USD']; // List of currencies
  currenciesto: string[] = ['USD', 'EUR', ]; // List of currencies
  amount: string = 'AED 10,000';
  showContent: boolean = false;
  showCurrencyContent: boolean = false;
  convertedAmount: string | null = null; // Add this property
  uploadedDocuments: string[] = [];
  accountDetails: any[] = [];
  quoteId: string = '';
  showUploadContent: boolean = false;
  currency_convertingfrom: string = 'AED';
  currency_convertingto: string = 'USD';
  amountPaid: number = 0;
  currencyPaid: string = 'AED';
  selectedFromCurrency: any; 
  toAmount: number = 0;
  selectedFiles: File[] = [];
  selectedBankDetail: any | null = null;
  showBankDetails: boolean = false; // Add this line
  bankDetails: any = {
    AED: {
      bank_name: 'Abu Dhabi Commercial Bank',
      account_name: 'Virtuzone FZ LLC',
      iban_number: 'AE080030010515838124001',
      account_number: '10515838124001',
      swift_code: 'ADCBAEAAXXX',
      bank_address: 'Souq Al Bahar'
    },
    USD: {
      bank_name: 'Abu Dhabi Commercial Bank',
      account_name: 'Virtuzone FZ LLC',
      iban_number: 'AE870030010515838193001',
      account_number: '10515838193001',
      swift_code: 'ADCBAEAAXXX',
      bank_address: 'Souq Al Bahar'
    },
    EUR: {
      bank_name: 'Abu Dhabi Commercial Bank',
      account_name: 'Virtuzone FZ LLC',
      iban_number: 'AE480030010515838197001',
      account_number: '10515838197001',
      swift_code: 'ADCBAEAAXXX',
      bank_address: 'Souq Al Bahar'
    }
  };

  constructor(private onlinePaymentService: OnlinePaymentService, 
    private bankTransferService: BankTransferService,
    private route: ActivatedRoute ,
    private router: Router) { }

    title = 'frontend';


  
    ngAfterViewInit() {
      // You can now access properties or methods of the sidebar component
      if (this.sidebar) {
        this.defaultValue = this.sidebar.piData.partPayment;
      
      }
    }
  
 

    onFileSelect(event: Event): void {
      const element = event.currentTarget as HTMLInputElement;
      let files: FileList | null = element.files;
      if (files) {
        console.log('Files selected:', files);
        // Handle the file upload process here, possibly using Angular's HttpClient
      }
    }

    removeFile(index: number): void {
      this.uploadedDocuments.splice(index, 1);
    }

    ngOnInit(): void {
      // Call the getAccountDetails method to fetch account details
      this.route.params.subscribe((params: { [x: string]: string; }) => {
        this.quoteId = params['id']; // Adjust the key if it's different
        // Now you can use this.quoteId in your component
        // const defaultValue = this.sidebar.piData.partPayment;
        // this.defaultValue = this.sidebar.piData.partPayment;
        this.fetchPiData(this.quoteId, () => {

          console.log("...ji")
          this.selectChangeHandler({ target: { value: 'AED' } });
        });
      });
  


      // this.onlinePaymentService.getAccountDetails().subscribe(
      //   (data: any[]) => {
      //     this.accountDetails = data;
      //     // console.log("sssssssssssssssssssss",this.accountDetails)
      //     // Do something with the fetched account details
      //   },
      //   (        error: any) => {
      //     console.error(error);
      //     // Handle error
      //   }
      // );



  }
  parseInputValue(value: string): number {
    return parseFloat(value); 
  }
  
  getValue(val: number) {
    console.warn(val);
    this.amountPaid = val;
  }
  

  fetchPiData(quoteId: string, callback: () => void): void {
    this.onlinePaymentService.getPiDataById(quoteId).subscribe(
      (response) => {
       
        this.piData = response;
        this.defaultValue = response.partPayment;
        callback();
        
      },
      (error) => {
        console.error('Error fetching Pi Data:', error);
      }
    );
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
  selectChangeHandler(event: any): void {
    this.selectedCurrency = event.target.value;
    this.currencyPaid = this.selectedCurrency;
// Make sure this line is executed when you want to show the bank details.
 

    // Find the selected bank details based on the currency
    this.selectedBankDetail = this.bankDetails[this.selectedCurrency];
    this.showBankDetails = true;

    this.bankTransferService.convertCurrency(this.currency_convertingfrom, this.currencyPaid, this.defaultValue)
        .subscribe(
          (response: any) => {
            this.toAmount = response.convertedAmount;
            console.log(response)
            console.log(`Converted amount: ${this.amountPaid}`);
          },
          error => {
            console.error('Error during currency conversion', error);
          }
        );
  }

  selectToChangeHandler (event: any) {
    //update the ui
    this.selectedToCurrency = event.target.value;
    this.currency_convertingto=this.selectedToCurrency
    console.log(",",this.selectedToCurrency)
  }

  submitForm() {
    // console.log('piData.partPayment:',this.currencyPaid);
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      alert("Please upload a file.");
      return;
    }
    const formData = {
      currency_convertingfrom: "AED",
      currency_convertingto:this.currencyPaid,
      amountPaid: this.amountPaid,
      currencyPaid: this.currencyPaid,
      Converted_value:this.toAmount
    };
    console.log(this.currency_convertingfrom,this.currency_convertingto)

    if (this.selectedFiles) {
      this.bankTransferService.sendBankTransferData(this.quoteId, formData, this.selectedFiles).subscribe(
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
      // Handle the case where no file is selected
      console.error("No file selected");
      // You can also choose to send the form data without the file or show an error message to the user
    }
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

    // convert() {
    //   this.bankTransferService.convertCurrency(this.currency_convertingfrom, this.currency_convertingto, this.defaultValue)
    //     .subscribe(
    //       (response: any) => {
    //         this.toAmount = response.convertedAmount;
    //         console.log(response)
    //         console.log(`Converted amount: ${this.amountPaid}`);
    //       },
    //       error => {
    //         console.error('Error during currency conversion', error);
    //       }
    //     );
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
