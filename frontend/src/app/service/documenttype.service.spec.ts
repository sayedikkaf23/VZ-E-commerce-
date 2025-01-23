import { TestBed } from '@angular/core/testing';

import { DocumenttypeService } from './documenttype.service';

describe('DocumenttypeService', () => {
  let service: DocumenttypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumenttypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
