import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailsManagement1Component } from './mails-management-1.component';

describe('MailsManagement1Component', () => {
  let component: MailsManagement1Component;
  let fixture: ComponentFixture<MailsManagement1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailsManagement1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailsManagement1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
