import { Component } from '@angular/core';
import { PaymentModeService } from '../service/payment-mode.service';

@Component({
  selector: 'app-payment-modes-management',
  templateUrl: './payment-modes-management.component.html',
  styleUrl: './payment-modes-management.component.css'
})
export class PaymentModesManagementComponent {
  paymentModeList: any = [];
  page: number | undefined;
  total_page: number | undefined;
  total_pages: number[] | undefined;
  pageLimit: any;
  searchTerm: any = '';

  sortOrder: { column: string; direction: 'asc' | 'desc' } = {
    column: '',
    direction: 'asc',
  };

  constructor(private paymentModeService: PaymentModeService) {}

  ngOnInit(): void {
    this.page = 1;
    this.getPaymentModes(this.page);
  }

  getPaymentModes(page = 1) {
    this.page = page;
    this.paymentModeService
      .getPaymentModes(this.page, this.pageLimit)
      .subscribe({
        next: (res: any) => {
          this.paymentModeList = res?.data;
          this.total_page = res.pages;
          this.total_pages = Array(res.pages)
            .fill((_x: any, i: any) => i)
            .map((x, i) => i + 1);
        },
        error: () => {
          this.paymentModeList = [];
        },
        complete: () => {},
      });
  }

  onUserStatusChange(paymentMode: any) {
    if (paymentMode?._id) {
      this.paymentModeService
        .updatePaymentModeStatus({
          isActive: paymentMode?.isActive,
          paymentModeId: paymentMode?._id,
          name: paymentMode?.name,
        })
        .subscribe({
          next: (res: any) => {},
          error: () => {},
          complete: () => {},
        });
    }
  }

  onPaymentModeSearch() {
    if (this.searchTerm) {
      this.searchPaymentModes();
    } else {
      this.resetSearchAndFetchPaymentModes();
    }
  }

  searchPaymentModes() {
    this.paymentModeService
      .searchPaymentMode({
        searchTerm: this.searchTerm,
      })
      .subscribe((res: any) => {
        this.paymentModeList = res?.data;
        this.total_page = res.pages;
        this.total_pages = Array(res.pages)
          .fill((x: any, i: any) => i)
          .map((x, i) => i + 1);
      });
  }

  resetSearchAndFetchPaymentModes() {
    this.page = 1;
    this.searchPaymentModes();
  }

  sortColumn(column: string) {
    if (this.sortOrder.column === column) {
      // Toggle sorting direction if the same column is clicked
      this.sortOrder.direction =
        this.sortOrder.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Set default sorting direction for a new column
      this.sortOrder.column = column;
      this.sortOrder.direction = 'asc';
    }

    // Perform sorting based on the selected column and direction
    this.paymentModeList.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const aValue = a[column];
      const bValue = b[column];

      if (aValue < bValue) {
        return this.sortOrder.direction === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return this.sortOrder.direction === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }
}
