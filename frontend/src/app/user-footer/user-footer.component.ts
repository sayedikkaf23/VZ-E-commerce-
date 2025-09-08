import { Component, OnInit } from '@angular/core';
import { OnlinePaymentService } from '../service/online-payment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-footer',
  templateUrl: './user-footer.component.html',
  styleUrl: './user-footer.component.css'
})
export class UserFooterComponent {
  piData: any;

  constructor(
    private onlinePaymentService: OnlinePaymentService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get quoteId from route params
    this.route.params.subscribe(params => {
      const quoteId = params['id'];
      if (quoteId) {
        this.onlinePaymentService.getPiDataById(quoteId).subscribe(
          (data: any) => {
            this.piData = data;
          },
          (error: any) => {
            console.error('Error fetching Pi data:', error);
          }
        );
      }
    });
  }
}
