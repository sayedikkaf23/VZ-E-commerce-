// checkout.component.ts
import {
  Component, OnInit, OnDestroy, ElementRef, Renderer2, AfterViewInit , ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

 import { OnlinePaymentService } from '../service/online-payment.service';

@Component({
  selector: 'app-checkout',
 templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
  loading = true;
  private scriptEl?: HTMLScriptElement;
  private checkoutId = '';
  private integrity  = '';
  private quoteId = '';

  piData: any;
  paymentDetails: any;
  constructor(
    private route: ActivatedRoute,
    private paySvc: OnlinePaymentService,
    private rnd: Renderer2,
    private router: Router,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit() {
     this.quoteId = this.route.snapshot.paramMap.get('id')!;
    this.paySvc.payCheckout(this.quoteId).subscribe({
      next: ({ id, integrity }) => {
        this.checkoutId = id;
        this.integrity  = integrity;
        this.injectScript();
      },
      error: () => alert('Failed to initialise checkout')
    });
     this.fetchPiData(this.quoteId);
  }

    fetchPiData(sfId: string): void {
    this.paySvc.getPiDataById(sfId).subscribe(
      (response) => {
        console.log('Fetched Pi Data:', response);
        this.piData = response; // Assign the fetched data to the piData property
      },
      (error) => {
        console.error('Error fetching Pi Data:', error);
        // Handle error, show error message, etc.
      }
    );
  }

  injectScript() {
    /* 1. <script src="…paymentWidgets.js?checkoutId"> */
    this.scriptEl = this.rnd.createElement('script');
    this.scriptEl!.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${this.checkoutId}`;
    this.scriptEl!.setAttribute('integrity', this.integrity);
    this.scriptEl!.setAttribute('crossorigin', 'anonymous');

    /* 2. <form action="…" class="paymentWidgets" data-brands="VISA MASTER"> */
    const formEl = this.rnd.createElement('form');
    formEl.action = `https://ecommerce.virtuzone.com/successful/${this.quoteId}`;   // shopperResultUrl
    formEl.className = 'paymentWidgets';
    formEl.setAttribute('data-brands', 'VISA MASTER');           // only show card brands you need

    /* 3. Append both to the DOM */
    const hostDiv = this.host.nativeElement.querySelector('#widgetHost');
    if (hostDiv) {
      if (this.scriptEl) {
        hostDiv.appendChild(this.scriptEl);
      }
      hostDiv.appendChild(formEl);
      this.loading = false;
    } else {
      console.error('widgetHost div not found');
    }
  }

  ngAfterViewInit() {
    /* If script loads before form, widget auto-initialises.
       If not, paymentWidgets.js will watch DOM and initialise after load. */
  }

    onPaymentSuccess(): void {
    console.log('Payment successful');
    
    // Redirect to the shopper result URL if available
    if (this.paymentDetails?.checkoutId) {
      // Use the actual result URL pattern from your API
      const resultUrl = `https://vzatnew.yeepeey.com/payment-result?id=${this.paymentDetails.checkoutId}&quotepaymentId=${this.paymentDetails.quotepaymentId}`;
      window.location.href = resultUrl;
    } else {
      // Fallback to local result page
      this.router.navigate(['/payment/result'], {
        queryParams: {
          status: 'success',
          paymentId: this.paymentDetails?.paymentId,
          amount: this.paymentDetails?.amount,
          quotepaymentId: this.paymentDetails?.quotepaymentId
        }
      });
    }
  }

  onPaymentFailure(): void {
    console.log('Payment failed');
    this.router.navigate(['/payment/result'], {
      queryParams: {
        status: 'failure',
        paymentId: this.paymentDetails?.paymentId,
        quotepaymentId: this.paymentDetails?.quotepaymentId
      }
    });
  }

  onPaymentCancel(): void {
    console.log('Payment cancelled');
    // Return to payment schedule
    if (this.paymentDetails?.quotepaymentId) {
      this.router.navigate(['/paymentSchedule', this.paymentDetails.quotepaymentId]);
    } else {
      this.router.navigate(['/paymentSchedule']);
    }
  }

  ngOnDestroy() {
    /* Clean up the script tag on route change */
    this.scriptEl?.parentNode?.removeChild(this.scriptEl);
  }
}
