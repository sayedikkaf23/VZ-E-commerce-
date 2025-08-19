// checkout.component.ts
import {
  Component, OnInit, OnDestroy, ElementRef, Renderer2, AfterViewInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

 import { OnlinePaymentService } from '../service/online-payment.service';

@Component({
  selector: 'app-checkout',
  template: `
    <div id="widgetHost"></div>

    <!-- The form will be injected here after the script loads -->
    <div *ngIf="loading" class="spinner">Loading payment form…</div>
  `
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
  loading = true;
  private scriptEl?: HTMLScriptElement;
  private checkoutId = '';
  private integrity  = '';
  private quoteId = '';

  constructor(
    private route: ActivatedRoute,
    private paySvc: OnlinePaymentService,
    private rnd: Renderer2,
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

  ngOnDestroy() {
    /* Clean up the script tag on route change */
    this.scriptEl?.parentNode?.removeChild(this.scriptEl);
  }
}
