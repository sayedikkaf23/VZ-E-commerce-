import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankTransferSuccessComponent } from './bank-transfer-success.component';

describe('BankTransferSuccessComponent', () => {
  let component: BankTransferSuccessComponent;
  let fixture: ComponentFixture<BankTransferSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankTransferSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankTransferSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
