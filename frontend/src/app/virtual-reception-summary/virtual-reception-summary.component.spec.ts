import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualReceptionSummaryComponent } from './virtual-reception-summary.component';

describe('VirtualReceptionSummaryComponent', () => {
  let component: VirtualReceptionSummaryComponent;
  let fixture: ComponentFixture<VirtualReceptionSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VirtualReceptionSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualReceptionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
