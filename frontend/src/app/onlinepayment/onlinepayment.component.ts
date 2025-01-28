import { Component, Input, OnInit, ViewChild, Renderer2 , OnDestroy} from '@angular/core';
import { OnlinePaymentService } from '../service/online-payment.service';
import { ActivatedRoute } from '@angular/router';
import { CardmachineService } from '../service/cardmachine.service';
import { Router } from '@angular/router';
import { CashovercounterService } from '../service/cashovercounter.service';
import { MessageService } from '../service/message.service';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import { environment } from '../../environments/environment';
// import { ManualInvoiceService } from '../services/manual-invoice.service';
@Component({
  selector: 'app-onlinepayment',
  templateUrl: './onlinepayment.component.html',
  styleUrls: ['./onlinepayment.component.css'],
})
export class OnlinepaymentComponent implements OnInit {
  @ViewChild('form', { static: false }) paymentForm: any;
  orderData: any; // Define orderData property
  piData: any;
  orderId: string = ''; // Initialize orderId property
  availablePaymentMethods: any[] = [];
  onlinepayment: any[] = [];
  loading: boolean = true;
  message: string = '';
  date: any = moment().format('YYYY:MM:DD-HH:mm:ss');
  hashExtended: string = '';
  loaded = {
    ui: false,
    api: false,
  };
  type: string = '';
  constructor(
    private renderer: Renderer2,
    private onlinePaymentService: OnlinePaymentService,
    private route: ActivatedRoute,
    private cashovercounterService: CashovercounterService,
    private CashMechinService: CardmachineService,
    private router: Router,
    private messageService: MessageService,
    // private manualInvoiceService: ManualInvoiceService
  ) {}

  ngOnInit(): void {

    // Remove top padding from the body
    this.renderer.setStyle(document.body, 'padding-top', '0px');


    this.type = (this.route.snapshot.data as any).type;
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
  
    if (this.type === 'online') {
      this.onlinePaymentFunction();
    }
  
   

    // Simulate a 3-second delay for the loader
    setTimeout(() => {
      this.onlinePaymentService.getPaymentMethods().subscribe(
        (response: any) => {
          this.availablePaymentMethods = response.paymentMethods;
          if (this.type === 'online') {
            this.loading = false;
          }
          // console.log(this.availablePaymentMethods);
        },
        (error) => {
          console.error('Error fetching available payment methods:', error);
          // Handle error
        }
      );
  
      this.onlinePaymentService.getPaymentModesHome().subscribe(
        (response: any) => {
          this.onlinepayment = response.paymentMethods;
          if (this.type === 'online') {
            this.loading = false;
          }
          // console.log('onlinepayment', this.onlinepayment);
        },
        (error) => {
          console.error('Error fetching available payment methods:', error);
          // Handle error
        }
      );
    }, 2000); // Delay in milliseconds
  }
  

  onlinePaymentFunction() {
    this.route.params.subscribe((params) => {
      this.orderId = params['id'];
      // console.log('Order ID:', this.orderId);

      // Fetch Pi Data based on orderId
      this.loading = true;

      this.onlinePaymentService.getQuoteById(this.orderId).subscribe((data) => {
        // console.log('Response from backend:', data);
        const isActive = data && data.isActive;
        // console.log(isActive);

        if (!isActive) {
          // Display an alert or handle it as needed
          this.messageService.setMessage(
            'You have already paid for the Proforma Invoice. Please contact your sales agent for more information.'
          );

          // Delay the navigation after 1 second (adjust as needed)

          this.router.navigate(['/onlinepayments/', this.orderId],{ queryParams: { type: this.type}});
          this.loading = false;
        } else {
          // Continue with other logic if isActive is true
          this.fetchPiData(this.orderId);
        }
      });

      // this.fetchPiData(this.orderId);

      // this.onlinePaymentService.getPaymentMethods().subscribe(
      //   (response: any) => {
      //     this.availablePaymentMethods = response.paymentMethods;
      //     console.log(this.availablePaymentMethods);
      //   },
      //   error => {
      //     console.error('Error fetching available payment methods:', error);
      //     // Handle error
      //   }
      // );

      // Initialize orderData here (replace this with your actual order data logic)
    });
  }

  // manualPaymentFunction() {
  //   this.manualInvoiceService.getManualInvoiceById(this.orderId).subscribe({
  //     next: (res: any) => {
  //       this.piData = {
  //         _id: res.data._id,
  //         totalPrice: res.data.totalAmount,
  //         totalIncludingVAT: res.data.totalAmount,
  //         partPayment: res.data.totalAmount,
  //         subTotal: res.data.totalAmount,
  //         status: res.data.status,
  //         quotePaymentId: res.data.accountId,
  //         payment_status: res.data.status,
  //         sendToPaymentGateway: false,
  //         quoteName: '',
  //         quoteEmail: '',
  //         product: res.data.items,
  //         ownerId: '',
  //         oppurtunityId: '',
  //         mobile: null,
  //         invoiceNumber: res.data.invoiceNumber,
  //         invoiceDate: '',
  //         invoiceCurrency: null,
  //         Discount: res.data.discount,
  //         AccountName: '',
  //         quote_createddate: '',
  //         quoteNumber: res.data.invoiceNumber,
  //         userName: '',
  //         userEmailId: '',
  //         userPhone: null,
  //         quotePaymentName: '',
  //         opportunityOwnerName: '',
  //         contactEmail: '',
  //         contactName: res.data.billTo,
  //         position: '',
  //         opportunityOwnerPhone: null,
  //         opportunityName: '',
  //         opportunityOwnerEmail: '',
  //         __v: 0,
  //       };
  //     },
  //     error: (error) => {
  //       if (error.status === 404) {
  //         alert(error.error.message); // invoice not found
  //         this.loading = false;
  //       } else {
  //       }
  //     },
  //     complete: () => {
  //       this.loading = false;
  //     },
  //   });
  // }

  ngAfterViewInit() {
    this.loaded.ui = true;
    this.generateHash();

    if (this.type === 'manual') {
      setTimeout(() => {
        this.setFormValues();
      }, 2000);
    }
  }

  generateHash() {
    if (this.loaded.api && this.loaded.ui) {
      this.loading = false;
      setTimeout(() => {
        this.setFormValues();
      }, 1000);
    }
  }

  setFormValues() {
    if (this.availablePaymentMethods?.[0]?.magnati) {
      let ApiRoute = 'user/magnatiTransactionStatus';
      if (this.type === 'manual') {
        ApiRoute = 'admin/ManualPaymentStatus';
      }
      (
        document.querySelector(
          "input[name='responseFailURL']"
        ) as HTMLInputElement
      ).value = `${environment.apiUrl}/${ApiRoute}`;
      (
        document.querySelector(
          "input[name='responseSuccessURL']"
        ) as HTMLInputElement
      ).value = `${environment.apiUrl}/${ApiRoute}`;

      const environmentUrl =
        'https://test.ipg-online.com/connect/gateway/processing"';

      const paymentForm: any =
        document.getElementById('paymentForm') ||
        this.paymentForm?.nativeElement;

      // Extract Payment Form Parameters
      const formData = new FormData(paymentForm);
      const paymentParameters: { [key: string]: string } = {};
      formData.forEach((value, key) => {
        if (value !== '') {
          paymentParameters[key] = value.toString();
        }
      });

      // Prepare Message Signature Content
      const sharedSecret = (
        document.querySelector("input[name='sharedsecret']") as HTMLInputElement
      ).value;
      const messageSignatureContent: string[] = [];
      const ignoreSignatureParameters = ['hashExtended'];
      Object.keys(paymentParameters)
        .filter((key) => !ignoreSignatureParameters.includes(key))
        .sort()
        .forEach((key) => {
          messageSignatureContent.push(paymentParameters[key]);
        });

      // Calculate Message Signature
      const messageSignature = CryptoJS.HmacSHA256(
        messageSignatureContent.join('|'),
        sharedSecret
      );
      const messageSignatureBase64 =
        CryptoJS.enc.Base64.stringify(messageSignature);

      // Update Form Parameters
      (
        document.querySelector("input[name='hashExtended']") as HTMLInputElement
      ).value = messageSignatureBase64;

      (document.querySelector("input[name='oid']") as HTMLInputElement).value =
        this.piData?.quotePaymentId;

      (
        document.querySelector("input[name='chargetotal']") as HTMLInputElement
      ).value = this.piData?.partPayment;

      // (
      //   document.querySelector(
      //     "input[name='totalIncludingVAT']"
      //   ) as HTMLInputElement
      // ).value = this.piData?.totalIncludingVAT;

      (
        document.querySelector("input[name='txndatetime']") as HTMLInputElement
      ).value = this.date;

      this.hashExtended = messageSignatureBase64;
    }
  }

  onPayNowClick(): void {
    // First, fetch the data using getPayNowDataById
    this.loading = true;
    this.onlinePaymentService.getPayNowDataById(this.orderId).subscribe(
      (response) => {
        // console.log('PayNow Data:', response);
        if (response.totalpayData.redirect_url) {
          // Redirect the user to the payment page

          // console.log(
          //   'response.totalpayData.redirect_url',
          //   response.totalpayData.redirect_url
          // );
          // console.log( " this.router.navigateByUrl",this.router.navigateByUrl)
          window.location.href = response.totalpayData.redirect_url;
          // this.loading = false;
          // this.router.navigateByUrl(response.totalpayData.redirect_url);
        }
      },
      (error) => {
        console.error('Error fetching PayNow Data:', error);
        // Handle error
        this.loading = false;
      }
    );
  }

  submitForm() {
    this.CashMechinService.sendCashMachinData(this.orderId).subscribe(
      (response) => {
        if ('message' in response) {
          // console.log(response);
          this.router.navigate([`/cardmachine/${this.orderId}`]);
        }
      },
      (error) => {
        console.error(error);
        this.router.navigate(['/failure', this.orderId]); // Handle the error
      }
    );
  }
  createSession(orderData: any): void {
    // Check if orderData is available before making the API call
    if (orderData) {
      this.onlinePaymentService.createTotalpaySession(orderData).subscribe(
        (response) => {
          // console.log('Totalpay session created:', response);
          // Redirect the user to the Totalpay payment page
          if (response.redirect_url) {
            window.open(response.redirect_url, '_blank');
          }
        },
        (error) => {
          console.error('Error creating Totalpay session:', error);
          // Handle error
        }
      );
    } else {
      console.error('Error: orderData is not available.');
      // Handle error - orderData is required for creating a session
    }
  }

  fetchPiData(sfId: string): void {
    this.onlinePaymentService.getPiDataById(sfId).subscribe(
      (response) => {
        // console.log('Fetched Pi Data:', response);
        this.piData = response; // Assign the fetched data to the piData property
        this.loaded.api = true;
        this.generateHash();
      },
      (error) => {
        console.error('Error fetching Pi Data:', error);
        // Handle error, show error message, etc.
      }
    );
  }

  handleCashOverCounterClick(quotePaymentId: string, amount: number) {
    // Check if the amount is greater than or equal to 55000

    // console.log('quotePaymentId:', amount > 55000);

    if (amount < 55000) {
      // Call your function or navigate based on your requirement
      // console.log('Inside if block');
      this.router.navigate(['/cashover-counter/', quotePaymentId],{ queryParams: { type: this.type}});
      this.navigateToCustomFunction();
    } else {
      // console.log('Inside else block');
      // Navigate to '/cashovercounter/' + quotePaymentId
      this.router.navigate(['/cashovercounter/', quotePaymentId],{ queryParams: { type: this.type}});
    }
  }

  navigateToCustomFunction() {
    this.cashovercounterService
    .sendCashCounterData(this.orderId, new FormData())
      .subscribe(
        (response: any) => {
          if (response) {
            // console.log('Response:', response);
            if (
              response.message ===
              'Cash Over Counter Transfer processed successfully'
            ) {
              // console.log('OrderId:', this.orderId);
              this.router.navigate([`/success/${this.orderId}`],{ queryParams: { type: this.type}});
            } else if (
              response.message === 'Cash Over Counter Transfer processed'
            ) {
              // this.router.navigate([`/cashover-counter/${this.orderId}`]);
              // console.log('Salesforce API called successfully ');
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

  onPayNowByStripe(): void {
    // First, fetch the data using getPayNowDataById
    this.loading = true;
    this.onlinePaymentService.payNowByStripe(this.orderId).subscribe(
      (response) => {
        // console.log('PayNow Data:', response);
        if (response.stripeData.url) {
          // Redirect the user to the payment page
          // console.log("response.stripeData.url",response.stripeData.url)
          // this.router.navigateByUrl(response.stripeData.url);

          window.location.href = response.stripeData.url;
          // this.loading = false;
          // window.open(response.stripeData.url, '_blank');
        }
      },
      (error) => {
        console.error('Error fetching PayNow Data:', error);
        // Handle error
        this.loading = false;
      }
    );
  }
  onPayViaTelr(): void {
    // First, fetch the data using getPayNowDataById
    this.loading = true;
    this.onlinePaymentService.PayViaTelr(this.orderId).subscribe(
      (response) => {
        // console.log('PayNow Data:', response);
        if (response.telrData) {
          // Redirect the user to the payment page
          // console.log("response.stripeData.url",response.stripeData.url)
          // this.router.navigateByUrl(response.stripeData.url);

          window.location.href = response.telrData.order.url;
          // this.loading = false;
          // window.open(response.stripeData.url, '_blank');
        }
      },
      (error) => {
        console.error('Error fetching PayNow Data:', error);
        // Handle error
        this.loading = false;
      }
    );
  }

  // onPayNowByMagnati(): void {
  //   // First, fetch the data using getPayNowDataById
  //   this.loading = true;
  //   this.onlinePaymentService.payNowByMagnati(this.orderId).subscribe(
  //     (response) => {
  //       if (response?.magnatiData?.paymentUrl) {
  //         window.location.href = response?.magnatiData?.paymentUrl;
  //         this.loading = false;
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching PayNow Data:', error);
  //       // Handle error
  //       this.loading = false;
  //     }
  //   );
  // }


  onNavigate() {
    const quotePaymentId = this.piData?.quotePaymentWithDetails?.QuotePaymentId;
    // console.log('Attempting to navigate with QuotePaymentId:', quotePaymentId);
  
    if (quotePaymentId) {
      // Navigate to the route programmatically
      this.router.navigate(['/cashdeposit', quotePaymentId]);
      // console.log('Navigation to /cashdeposit/' + quotePaymentId + ' initiated.');
    } else {
      console.error('QuotePaymentId is undefined or invalid.');
      this.showErrorMessage('Payment ID is missing. Cannot proceed with cash deposit.');
    }
  }
  
  showErrorMessage(message: string) {
    // Implement your error display logic here (e.g., using a modal or toast notification)
    alert(message); // Simple alert for demonstration purposes
  }
  

}