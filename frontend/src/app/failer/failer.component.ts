import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-failer',
  templateUrl: './failer.component.html',
  styleUrls: ['./failer.component.css']
})
export class FailerComponent implements OnInit {
  transactionId!: string;
  reason: string = '';
  type: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.transactionId = params.get('id') ?? '';
    });

    this.route.queryParamMap.subscribe((params) => {
      this.type = params.get('type') ?? '';
      this.reason = params.get('reason') ?? '';
      if (this.reason) {
        alert(this.reason);
      }
    });
  }

  tryAgain() {
    const baseUrl = 'https://ecommerce.yeepeey.com';
    const endpoint =  'onlinepayment';
    window.location.href = `${baseUrl}/${endpoint}/${this.transactionId}`;
  }
}
