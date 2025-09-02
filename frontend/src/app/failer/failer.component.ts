import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnlinePaymentService } from '../service/online-payment.service';

@Component({
  selector: 'app-failer',
  templateUrl: './failer.component.html',
  styleUrls: ['./failer.component.css']
})
export class FailerComponent implements OnInit {
  transactionId!: string;
  reason: string = '';
  type: string = '';
  orderId: string = '';
  piData: any;
  email: string = '';

  constructor( private onlinePaymentService: OnlinePaymentService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {

     this.route.queryParams.subscribe(params => {
    const status = params['status'];

    // Only reload once
    if (status === 'failure' && !sessionStorage.getItem('reloaded')) {
      sessionStorage.setItem('reloaded', 'true');

      // Full page reload
      window.location.reload();
    } else {
      // After reload, remove the flag
      sessionStorage.removeItem('reloaded');
    }
  });


    this.route.paramMap.subscribe((params) => {
      this.transactionId = params.get('id') ?? '';
    });
    this.paymentProcessing();
    this.route.queryParamMap.subscribe((params) => {
      this.type = params.get('type') ?? '';
      this.reason = params.get('reason') ?? '';
      console.log("type: ", this.type);
      console.log("reason: ", this.reason);
      if (this.reason) {
        alert(this.reason);
      }
    });
    
  }

  sendEmail() {

    if (!this.email) {
      console.error('Cannot send email. Email is undefined.');
      return;
    }
    this.onlinePaymentService.sendWaitingMail(this.email) // Only passing user email
      .subscribe(response => {
        console.log('Email Sent:', response);
      }, error => {
        console.error('Error sending email:', error);
      });
  }

  paymentProcessing() {
    this.route.params.subscribe((params) => {
      this.orderId = params['id'];
      // console.log('Order ID:', this.orderId);
      // Fetch Pi Data based on orderId
      this.fetchPiData(this.orderId);
    });
  }

  fetchPiData(quoteId: string): void {
    this.onlinePaymentService.getPiDataById(quoteId).subscribe(
      (response: any) => {
        // console.log('Fetched Pi Data:', response);
        this.piData = response; // Assign the fetched data to the piData property
        console.log(this.piData?.leadWithDetails?.Email,"piData");
        this.email = this.piData?.leadWithDetails?.Email;
        if (this.email) {
          console.log(`Email fetched: ${this.email}`);
          this.sendEmail();
        } else {
          console.error('No email found in the fetched data.');
        }
      },
      (error: any) => {
        console.error('Error fetching Pi Data:', error);
        // Handle error, show error message, etc.
      }
    );
  }

}
