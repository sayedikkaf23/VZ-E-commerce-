import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMailManagementComponent } from './admin-mail-management.component';

describe('AdminMailManagementComponent', () => {
  let component: AdminMailManagementComponent;
  let fixture: ComponentFixture<AdminMailManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminMailManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMailManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
