import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnlinePaymentService } from '../service/online-payment.service';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css'],
})
export class SuccessComponent implements OnInit {
  amount: string = '';
  quoteId: string = '';
  piData: any;
  refreshPageFlag: boolean = false;
  type: string = '';
  constructor(
    private route: ActivatedRoute,
    private onlinePaymentService: OnlinePaymentService,
    private location: LocationStrategy
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      const status = params['status'];

      // Only reload once
      if (status === 'success' && !sessionStorage.getItem('reloadedSuccess')) {
        sessionStorage.setItem('reloadedSuccess', 'true');

        // Full page reload
        window.location.reload();
      } else {
        // After reload, remove the flag
        sessionStorage.removeItem('reloadedSuccess');
      }
    });

    this.route.params.subscribe((params) => {
      this.quoteId = params['id'];
      this.amount = params['amount'];
      // console.log('quoteId:', this.quoteId);
    });

    this.type = this.route.snapshot.queryParamMap.get('type') || 'online';
    // Disable back button
    this.disableBackButton();

    // Fetch Pi Data
    this.fetchPiData(this.quoteId);
    if (this.type !== 'manual') {
      this.callPayNowSaleforce(this.quoteId);
    }

    // setTimeout(() => {
    //   this.refreshPage();
    // }, 2000); // 3000 milliseconds (3 seconds) delay, adjust as needed
  }

  fetchPiData(quoteId: string): void {
    this.onlinePaymentService.getPiDataById(quoteId).subscribe(
      (res: any) => {
        if (this.type === 'manual') {
          this.piData = {
            _id: res._id,
            totalPrice: res.totalAmount,
            totalIncludingVAT: res.totalAmount,
            partPayment: res.totalAmount,
            subTotal: res.totalAmount,
            status: res.status,
            quotePaymentId: res.accountId,
            payment_status: res.status,
            sendToPaymentGateway: false,
            quoteName: '',
            quoteEmail: '',
            product: res.items,
            ownerId: '',
            oppurtunityId: '',
            mobile: res.salesPersonMobile,
            invoiceNumber: res.invoiceNumber,
            invoiceDate: '',
            invoiceCurrency: null,
            Discount: res.discount,
            AccountName: '',
            quote_createddate: '',
            quoteNumber: res.invoiceNumber,
            userName: '',
            userEmailId: '',
            userPhone: null,
            quotePaymentName: '',
            opportunityOwnerName: '',
            contactEmail: '',
            contactName: res.billTo,
            position: '',
            opportunityOwnerPhone: null,
            opportunityName: res.salesPersonName,
            opportunityOwnerEmail: res.salesPersonEmail,
          };
          // console.log('this.piData: ', this.piData);
        } else {
          this.piData = res;
        }
      },
      (error) => {
        console.error('Error fetching Pi Data:', error);
      }
    );
  }

  refreshPage() {
    location.reload();
  }

  callPayNowSaleforce(quoteId: string): void {
    this.onlinePaymentService.payNowSaleforce(quoteId).subscribe(
      (response) => {
        console.log('PayNowSaleforce Response:', response);
        // Handle the response if needed
      },
      (error) => {
        console.error('Error calling PayNowSaleforce:', error);
      }
    );
  }

  // Function to disable the back button
  disableBackButton() {
    // Push a new history entry with an empty title
    history.pushState(null, '', window.location.href);
  
    // Listen for back navigation and prevent it
    window.onpopstate = () => {
      history.pushState(null, '', window.location.href);
    };
  
    // Listen for changes in browser history
    this.location.onPopState(() => {
      history.pushState(null, '', window.location.href);
    });
  }
  
}