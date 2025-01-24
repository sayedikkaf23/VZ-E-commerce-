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

    // Disable back button
    this.disableBackButton();
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
