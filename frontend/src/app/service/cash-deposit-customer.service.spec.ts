import { TestBed } from '@angular/core/testing';

import { CashDepositCustomerService } from './cash-deposit-customer.service';

describe('CashDepositCustomerService', () => {
  let service: CashDepositCustomerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashDepositCustomerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});