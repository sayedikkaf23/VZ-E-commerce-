import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualReceptionist1Component } from './virtual-receptionist-1.component';

describe('VirtualReceptionist1Component', () => {
  let component: VirtualReceptionist1Component;
  let fixture: ComponentFixture<VirtualReceptionist1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VirtualReceptionist1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualReceptionist1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
