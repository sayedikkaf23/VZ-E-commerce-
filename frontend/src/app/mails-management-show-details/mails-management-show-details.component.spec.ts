import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailsManagementShowDetailsComponent } from './mails-management-show-details.component';

describe('MailsManagementShowDetailsComponent', () => {
  let component: MailsManagementShowDetailsComponent;
  let fixture: ComponentFixture<MailsManagementShowDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailsManagementShowDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailsManagementShowDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
