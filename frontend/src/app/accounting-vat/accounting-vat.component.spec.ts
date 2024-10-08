import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingVatComponent } from './accounting-vat.component';

describe('AccountingVatComponent', () => {
  let component: AccountingVatComponent;
  let fixture: ComponentFixture<AccountingVatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountingVatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountingVatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
