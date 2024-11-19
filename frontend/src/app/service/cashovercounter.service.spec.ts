import { TestBed } from '@angular/core/testing';

import { CashovercounterService } from './cashovercounter.service';

describe('CashovercounterService', () => {
  let service: CashovercounterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashovercounterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
