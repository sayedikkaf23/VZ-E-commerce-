import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPaymentMethordComponent } from './admin-payment-methord.component';

describe('AdminPaymentMethordComponent', () => {
  let component: AdminPaymentMethordComponent;
  let fixture: ComponentFixture<AdminPaymentMethordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPaymentMethordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPaymentMethordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
