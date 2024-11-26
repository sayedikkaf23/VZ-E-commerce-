import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDashboardLayoutComponent } from './user-dashboard-layout.component';

describe('UserDashboardLayoutComponent', () => {
  let component: UserDashboardLayoutComponent;
  let fixture: ComponentFixture<UserDashboardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserDashboardLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
