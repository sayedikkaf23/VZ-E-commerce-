import { TestBed } from '@angular/core/testing';

import { GetnationalityService } from './getnationality.service';

describe('GetnationalityService', () => {
  let service: GetnationalityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetnationalityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
