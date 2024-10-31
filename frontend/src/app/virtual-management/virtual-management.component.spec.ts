import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualManagementComponent } from './virtual-management.component';

describe('VirtualManagementComponent', () => {
  let component: VirtualManagementComponent;
  let fixture: ComponentFixture<VirtualManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VirtualManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
