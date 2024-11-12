import { Component, OnInit } from '@angular/core';
import { PaymentMethodService } from '../service/payment-methord.service';
@Component({
  selector: 'app-admin-payment-methord',
  templateUrl: './admin-payment-methord.component.html',
  styleUrl: './admin-payment-methord.component.css'
})
export class AdminPaymentMethordComponent {

  paymentMethods: any = [];

  constructor(private paymentService: PaymentMethodService) {}

  ngOnInit(): void {
    this.getPaymentMethods();
  }

  getPaymentMethods(): void {
    this.paymentService.getPaymentMethods().subscribe({
      next: (res: any) => {
        console.log("object")
        this.paymentMethods = [res]; // Wrap response in an array if only one object is returned

        console.log( this.paymentMethods,"paymentMethods")
      },
      error: () => {
        console.log("8")
        this.paymentMethods = [];
      },
    });
  }

  onPaymentMethodStatusChange(payment: any, methodType: string): void {
    const updatedValue = { [methodType]: !payment[methodType] };
    this.paymentService.updatePaymentMethodStatus(payment._id, updatedValue).subscribe({
      next: () => {
        payment[methodType] = !payment[methodType]; // Update local data on success
      },
      error: (err) => {
        console.error('Error updating payment method status:', err);
      },
    });
  }
}
