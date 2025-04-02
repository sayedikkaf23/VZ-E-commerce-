import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryRiskManagementComponent } from './country-risk-management.component';

describe('CountryRiskManagementComponent', () => {
  let component: CountryRiskManagementComponent;
  let fixture: ComponentFixture<CountryRiskManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CountryRiskManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryRiskManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
