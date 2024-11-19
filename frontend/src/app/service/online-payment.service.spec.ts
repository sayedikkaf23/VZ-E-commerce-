import { TestBed } from '@angular/core/testing';

import { OnlinePaymentService } from './online-payment.service';

describe('OnlinePaymentService', () => {
  let service: OnlinePaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnlinePaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
