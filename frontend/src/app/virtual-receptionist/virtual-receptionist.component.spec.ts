import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualReceptionistComponent } from './virtual-receptionist.component';

describe('VirtualReceptionistComponent', () => {
  let component: VirtualReceptionistComponent;
  let fixture: ComponentFixture<VirtualReceptionistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualReceptionistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VirtualReceptionistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
