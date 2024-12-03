import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashoverCounterComponent } from './cashover-counter.component';

describe('CashoverCounterComponent', () => {
  let component: CashoverCounterComponent;
  let fixture: ComponentFixture<CashoverCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CashoverCounterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashoverCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
