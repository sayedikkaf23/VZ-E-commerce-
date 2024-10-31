import { TestBed } from '@angular/core/testing';

import { VirtualManagementService } from './virtual-management.service';

describe('VirtualManagementService', () => {
  let service: VirtualManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VirtualManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
