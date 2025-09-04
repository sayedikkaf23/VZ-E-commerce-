import { Component, OnInit } from '@angular/core';
import { OnlinePaymentService } from '../service/online-payment.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-bank-transfer-success',
  templateUrl: './bank-transfer-success.component.html',
  styleUrls: ['./bank-transfer-success.component.css']
})
export class BankTransferSuccessComponent implements OnInit {
  quoteId: string = '';
piData: any;
type: string = '';
private sentEmails: Set<string> = new Set();
  constructor(
    private onlinePaymentService: OnlinePaymentService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: { [x: string]: string }) => {
      this.quoteId = params['id'];
      // console.log(this.quoteId);
    });
   this.fetchPiData(this.quoteId);
    // Disable back button
    this.disableBackButton();
  }

   fetchPiData(quoteId: string): void {
    this.onlinePaymentService.getPiDataById(quoteId).subscribe(
      (res: any) => {
         console.log('Pi Data Response:', res); // <-- debug log

      // Safely pick an email if available
      const email =
        res?.leadWithDetails?.Email ||
        null;

      if (email) {
        if (this.sentEmails.has(quoteId)) {
          console.log(`Email already sent for quoteId: ${quoteId}, skipping...`);
          return;
        }

        this.onlinePaymentService.sendSuccessEmail(email).subscribe({
          next: (response) => {
            console.log('Email sent:', response);
            this.sentEmails.add(quoteId); // ✅ Mark as sent
          },
          error: (err) => console.error('Email failed:', err),
        });
      } else {
        console.warn('No email found in API response, skipping email send.');
      }
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

  // Function to disable the back button
  disableBackButton() {
    // Push a dummy state to disable back button
    window.history.pushState('', '', window.location.href);

    // Listen for changes in the URL and prevent navigation
    window.onpopstate = () => {
      window.history.pushState('', '', window.location.href);
    };

    // Show confirmation when user tries to leave the page
    this.location.subscribe(() => {
      window.history.pushState('', '', window.location.href);
    });
  }
}
