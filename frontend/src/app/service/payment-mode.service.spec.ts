import { TestBed } from '@angular/core/testing';

import { PaymentModeService } from './payment-mode.service';

describe('PaymentModeService', () => {
  let service: PaymentModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
