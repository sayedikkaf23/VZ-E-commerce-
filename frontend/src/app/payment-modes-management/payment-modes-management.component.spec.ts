import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentModesManagementComponent } from './payment-modes-management.component';

describe('PaymentModesManagementComponent', () => {
  let component: PaymentModesManagementComponent;
  let fixture: ComponentFixture<PaymentModesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentModesManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentModesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
