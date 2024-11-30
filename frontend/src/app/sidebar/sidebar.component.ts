import { Component, OnInit } from '@angular/core';
import { OnlinePaymentService } from '../service/online-payment.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
// import { MessageService } from '../services/message.service';
// import { ManualInvoiceService } from '../services/manual-invoice.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  orderData: any; // Define orderData property
  piData: any;
  orderId: string = ''; // Initialize orderId property
  sidebarData: any;
  type: string = '';
  loading: boolean = true;

  constructor(
    private onlinePaymentService: OnlinePaymentService,
    private route: ActivatedRoute,
    private router: Router,
    // private messageService: MessageService,
    // private manualInvoiceService: ManualInvoiceService
  ) {}

  ngOnInit(): void {

    this.type = this.route.snapshot.queryParamMap.get('type') || (this.route.snapshot.data as any).type || 'online';

    if (this.type === 'online') {
      this.onlinePaymentFunction();
    }

    // if (this.type === 'manual') {
    //   this.manualPaymentFunction();
    // }

    // Call createSession method when the component is initialized
    this.createSession(this.orderData);
    this.loading =true
    this.onlinePaymentService.getSidebarData().subscribe(
      (data: any) => {
        this.sidebarData = data;
        this.loading =false
      },
      (error: any) => {
        console.error('Error fetching sidebar data:', error);
        this.loading =false
      }
    );
  }

  onlinePaymentFunction() {
    this.route.params.subscribe((params) => {
      this.orderId = params['id'];
      console.log('Order ID:', this.orderId);
      // Fetch Pi Data based on orderId
      this.fetchPiData(this.orderId);
    });
  }

  // manualPaymentFunction() {
  //   const orderId = this.route.snapshot.paramMap.get('id');
  //   this.manualInvoiceService.getManualInvoiceById(orderId).subscribe({
  //     next: (res: any) => {
  //       this.piData = {
  //         _id: res?.data?._id,
  //         totalPrice: res?.data?.totalAmount,
  //         totalIncludingVAT: res?.data?.totalAmount,
  //         partPayment: res?.data?.totalAmount,
  //         subTotal: res?.data?.totalAmount,
  //         status: res?.data?.status,
  //         quotePaymentId: res?.data?.accountId,
  //         payment_status: res?.data?.status,
  //         sendToPaymentGateway: false,
  //         quoteName: '',
  //         quoteEmail: '',
  //         product: res?.data?.items,
  //         ownerId: '',
  //         oppurtunityId: '',
  //         mobile: res?.data?.salesPersonMobile,
  //         invoiceNumber: res?.data?.invoiceNumber,
  //         invoiceDate: '',
  //         invoiceCurrency: null,
  //         Discount: res?.data?.discount,
  //         AccountName: '',
  //         quote_createddate: '',
  //         quoteNumber: res?.data?.invoiceNumber,
  //         userName: '',
  //         userEmailId: '',
  //         userPhone: null,
  //         quotePaymentName: '',
  //         opportunityOwnerName: res?.data?.salesPersonName,
  //         contactEmail: '',
  //         contactName: res?.data?.billTo,
  //         position: '',
  //         opportunityOwnerPhone: null,
  //         opportunityName: res?.data?.salesPersonName,
  //         opportunityOwnerEmail: res?.data?.salesPersonEmail,
  //         __v: 0,
  //         logo: res?.data?.logo,
  //       };
  //     },
  //     error: () => {},
  //     complete: () => {
  //     },
  //   });
  // }

  createSession(orderData: any): void {
    // Check if orderData is available before making the API call
    if (orderData) {
      this.onlinePaymentService.createTotalpaySession(orderData).subscribe(
        (response: { redirect_url: string | URL | undefined; }) => {
          console.log('Totalpay session created:', response);
          // Redirect the user to the Totalpay payment page
          if (response.redirect_url) {
            window.open(response.redirect_url, '_blank');
          }
        },
        (error: any) => {
          console.error('Error creating Totalpay session:', error);
          // Handle error
        }
      );
    } else {
      console.error('Error: orderData is not available.');
      // Handle error - orderData is required for creating a session
    }
  }

  fetchPiData(quoteId: string): void {
    this.onlinePaymentService.getPiDataById(quoteId).subscribe(
      (response: any) => {
        console.log('Fetched Pi Data:', response);
        this.piData = response; // Assign the fetched data to the piData property
      },
      (error: any) => {
        console.error('Error fetching Pi Data:', error);
        // Handle error, show error message, etc.
      }
    );
  }
}