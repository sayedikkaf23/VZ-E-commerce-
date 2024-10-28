import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailsManagement3Component } from './mails-management-3.component';

describe('MailsManagement3Component', () => {
  let component: MailsManagement3Component;
  let fixture: ComponentFixture<MailsManagement3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailsManagement3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailsManagement3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
