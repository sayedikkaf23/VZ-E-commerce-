import { TestBed } from '@angular/core/testing';

import { MailManagementService } from './mail-management.service';
describe('MailManagementService', () => {
  let service: MailManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MailManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
