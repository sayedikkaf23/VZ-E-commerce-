import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailsManagement2Component } from './mails-management-2.component';

describe('MailsManagement2Component', () => {
  let component: MailsManagement2Component;
  let fixture: ComponentFixture<MailsManagement2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailsManagement2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailsManagement2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
