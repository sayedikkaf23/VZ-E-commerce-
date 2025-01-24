import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-cashover-counter',
  templateUrl: './cashover-counter.component.html',
  styleUrls: ['./cashover-counter.component.css']
})
export class CashoverCounterComponent implements OnInit {
  orderId: string = '';
  // Other properties and methods...

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // Inject your service here
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.orderId = params['id'];
      // console.log('Order ID:', this.orderId);

      // Fetch Pi Data based on orderId
     
    });
  }

  

  goBack() {
    // Navigate back using the router
    this.router.navigate([`/onlinepayment/${this.orderId}`]);
  }
}
