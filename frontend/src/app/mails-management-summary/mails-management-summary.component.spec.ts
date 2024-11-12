import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailsManagementSummaryComponent } from './mails-management-summary.component';

describe('MailsManagementSummaryComponent', () => {
  let component: MailsManagementSummaryComponent;
  let fixture: ComponentFixture<MailsManagementSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailsManagementSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailsManagementSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
