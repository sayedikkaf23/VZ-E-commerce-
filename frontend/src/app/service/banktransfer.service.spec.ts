import { TestBed } from '@angular/core/testing';

import { BanktransferService } from './banktransfer.service';

describe('BanktransferService', () => {
  let service: BanktransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BanktransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
