import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessBankAccountComponent } from './business-bank-account.component';

describe('BusinessBankAccountComponent', () => {
  let component: BusinessBankAccountComponent;
  let fixture: ComponentFixture<BusinessBankAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusinessBankAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessBankAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
