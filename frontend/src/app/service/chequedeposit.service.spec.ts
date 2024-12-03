import { TestBed } from '@angular/core/testing';

import { ChequedepositService } from './chequedeposit.service';

describe('ChequedepositService', () => {
  let service: ChequedepositService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChequedepositService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
