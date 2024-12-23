import { TestBed } from '@angular/core/testing';

import { AddcardService } from './addcard.service';

describe('AddcardService', () => {
  let service: AddcardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddcardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
