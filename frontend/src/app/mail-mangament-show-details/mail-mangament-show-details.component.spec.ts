import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailMangamentShowDetailsComponent } from './mail-mangament-show-details.component';

describe('MailMangamentShowDetailsComponent', () => {
  let component: MailMangamentShowDetailsComponent;
  let fixture: ComponentFixture<MailMangamentShowDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailMangamentShowDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailMangamentShowDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
