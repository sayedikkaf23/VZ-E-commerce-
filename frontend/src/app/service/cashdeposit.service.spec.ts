import { TestBed } from '@angular/core/testing';

import { CashdepositService } from './cashdeposit.service';

describe('CashdepositService', () => {
  let service: CashdepositService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashdepositService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
