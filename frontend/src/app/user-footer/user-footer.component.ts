import { Component, OnInit } from '@angular/core';
import { OnlinePaymentService } from '../service/online-payment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-footer',
  templateUrl: './user-footer.component.html',
  styleUrl: './user-footer.component.css'
})
export class UserFooterComponent {
  sidebarData: any;

  constructor(
    private onlinePaymentService: OnlinePaymentService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.onlinePaymentService.getSidebarData().subscribe(
      (data: any) => {
        this.sidebarData = data;
      },
      (error: any) => {
        console.error('Error fetching sidebar data:', error);
      }
    );
  }
}
