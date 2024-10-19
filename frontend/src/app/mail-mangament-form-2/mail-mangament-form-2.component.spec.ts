import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailMangamentForm2Component } from './mail-mangament-form-2.component';

describe('MailMangamentForm2Component', () => {
  let component: MailMangamentForm2Component;
  let fixture: ComponentFixture<MailMangamentForm2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailMangamentForm2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailMangamentForm2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
