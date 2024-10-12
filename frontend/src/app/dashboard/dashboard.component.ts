import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  // POS Order Value Time Wise chart end

  storeId: any = '';

  storeName: any = '';
  total_sales_report: any = 0;
  total_customers: any = 0;
  total_suppliers: any = 0;
  total_no_of_orders: any = 0;
  total_cancelled_orders: any = 0;
  total_no_of_item_sold: any = 0;
  total_branches: any = 0;
  total_completed_orders: any = 0;
  total_sum_cancelled_orders: any = 0;
  total_damaged_orders: any = 0;
  total_returned_orders: any = 0;
  total_partially_return_orders: any = 0;
  total_partially_damage_orders: any = 0;

  //for top orders
  orders: any = [];

  //for invoice details
  total_invoices: any = 0;
  total_open_invoices: any = 0;
  total_paid_invoices: any = 0;
  total_partially_paid_invoices: any = 0;
  total_cancelled_invoices: any = 0;
  total_return_invoices: any = 0;

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }
}