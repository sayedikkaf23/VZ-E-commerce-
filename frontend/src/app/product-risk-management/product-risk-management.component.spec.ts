import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRiskManagementComponent } from './product-risk-management.component';

describe('ProductRiskManagementComponent', () => {
  let component: ProductRiskManagementComponent;
  let fixture: ComponentFixture<ProductRiskManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductRiskManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductRiskManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
