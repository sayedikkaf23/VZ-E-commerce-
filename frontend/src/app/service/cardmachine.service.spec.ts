import { TestBed } from '@angular/core/testing';

import { CardmachineService } from './cardmachine.service';

describe('CardmachineService', () => {
  let service: CardmachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardmachineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
