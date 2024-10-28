import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualReceptionist2Component } from './virtual-receptionist-2.component';

describe('VirtualReceptionist2Component', () => {
  let component: VirtualReceptionist2Component;
  let fixture: ComponentFixture<VirtualReceptionist2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VirtualReceptionist2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualReceptionist2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
