import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
 import { OnlinePaymentService } from '../service/online-payment.service';
 import Swal from 'sweetalert2';
@Component({
  selector: 'app-payment-failure',
  templateUrl: './payment-failure.component.html',
  styleUrl: './payment-failure.component.css'
})
export class PaymentFailureComponent {
 transactionId: string | undefined;
  reason: string = '';
  type: string = '';
  private apiUrl = environment.apiUrl;
  constructor(private router: Router, private onlinePaymentService: OnlinePaymentService, private route: ActivatedRoute) {}

  ngOnInit() {
    // Subscribe to route parameter changes
    this.route.paramMap.subscribe((params) => {
      // Extract the 'id' parameter from the URL
      this.transactionId = params.get('id') ?? undefined;
    });

    this.route.queryParamMap.subscribe((params) => {
      this.type = params.get('type') ?? '';
    });

    this.reason = this.route.snapshot.queryParamMap.get('reason') ?? '';
    if (this.reason) {
      alert(this.reason);
    }
  }

  tryAgain() {
    // if (this.type === 'manual') {
    //   window.location.href = `${this.apiUrl}/manual/${this.transactionId}`;
    //   return;
    // }
    // window.location.href = `${this.apiUrl}/onlinepayment/${this.transactionId}`;
     this.callActivePaymentMethod(this.transactionId!);
  }

    callActivePaymentMethod(quotePaymentId: string ): void {
    this.onlinePaymentService.getPaymentModesHome().subscribe(
      (response: any) => {
        const activeMethod = response.paymentMethods.find((method: any) => method.isActive);
        if (!activeMethod) {
          Swal.fire('Error', 'No active payment method found', 'error');
          return;
        }
   
        switch (activeMethod.name.toLowerCase()) {
          case 'stripe':
            this.onlinePaymentService.payNowByStripe(quotePaymentId).subscribe(
              (res: any) => window.location.href = res.stripeData.url,
              () => Swal.fire('Error', 'Failed to redirect to Stripe', 'error')
            );
            break;
   
          case 'telr':
            this.onlinePaymentService.PayViaTelr(quotePaymentId).subscribe(
              (res: any) => window.location.href = res.telrData.order.url,
              () => Swal.fire('Error', 'Failed to redirect to Telr', 'error')
            );
            break;
   
          case 'total pay':
            this.onlinePaymentService.getPayNowDataById(quotePaymentId).subscribe(
              (res: any) => window.location.href = res.totalpayData.redirect_url,
              () => Swal.fire('Error', 'Failed to redirect to TotalPay', 'error')
            );
            break;
   
          default:
            Swal.fire('Error', 'Unsupported payment method', 'error');
        }
      },
      () => Swal.fire('Error', 'Unable to fetch payment methods', 'error')
    );
  }
}
