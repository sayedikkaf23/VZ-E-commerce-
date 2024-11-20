import { Component, OnInit } from '@angular/core';
import { PaymentMethodService } from '../service/payment-methord.service';
@Component({
  selector: 'app-admin-payment-methord',
  templateUrl: './admin-payment-methord.component.html',
  styleUrl: './admin-payment-methord.component.css'
})
export class AdminPaymentMethordComponent {

  paymentMethods: any = [];
  page: number | undefined;
  total_page: number | undefined;
  total_pages: number[] | undefined;
  pageLimit: any;
  searchTerm: any = '';

  constructor(private paymentService: PaymentMethodService) {}

  ngOnInit(): void {
    this.page = 1;
    this.getPaymentMethods(this.page);
  }

  getPaymentMethods(page: any) {
    this.page = page;
    this.paymentService.getPaymentMethods(this.page, this.pageLimit).subscribe({
      next: (res: any) => {
        this.paymentMethods = res?.data;
        this.total_page = res.pages;
        this.total_pages = Array(res.pages)
          .fill((x: any, i: number) => i)
          .map((x: any, i: number) => i + 1);
      },
      error: () => {
        this.paymentMethods = [];
      },
      complete: () => {},
    });
  }

  onPaymentMethodStatusChange(payment: any, methodType: string) {
    if (payment?._id) {
      const updateObject = { [methodType]: payment[methodType] };
      this.paymentService
        .updatePaymentMethodStatus(payment._id, updateObject)
        .subscribe({
          next: () => {},
          error: (err) => {},
          complete: () => {},
        });
    }
  }
}
