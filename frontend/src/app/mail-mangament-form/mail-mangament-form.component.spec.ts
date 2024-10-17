import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailMangamentFormComponent } from './mail-mangament-form.component';

describe('MailMangamentFormComponent', () => {
  let component: MailMangamentFormComponent;
  let fixture: ComponentFixture<MailMangamentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailMangamentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailMangamentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
