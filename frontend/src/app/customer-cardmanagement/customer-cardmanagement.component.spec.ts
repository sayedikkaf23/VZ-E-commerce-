import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCardmanagementComponent } from './customer-cardmanagement.component';

describe('CustomerCardmanagementComponent', () => {
  let component: CustomerCardmanagementComponent;
  let fixture: ComponentFixture<CustomerCardmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerCardmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerCardmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
