import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualReceptionistDetailsComponent } from './virtual-receptionist-details.component';

describe('VirtualReceptionistDetailsComponent', () => {
  let component: VirtualReceptionistDetailsComponent;
  let fixture: ComponentFixture<VirtualReceptionistDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VirtualReceptionistDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualReceptionistDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
