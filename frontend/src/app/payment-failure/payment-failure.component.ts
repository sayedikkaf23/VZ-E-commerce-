import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

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
  constructor(private router: Router, private route: ActivatedRoute) {}

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
    if (this.type === 'manual') {
      window.location.href = `${this.apiUrl}/manual/${this.transactionId}`;
      return;
    }
    window.location.href = `${this.apiUrl}/onlinepayment/${this.transactionId}`;
  }
}
