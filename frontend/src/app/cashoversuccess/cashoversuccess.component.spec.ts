import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashoversuccessComponent } from './cashoversuccess.component';

describe('CashoversuccessComponent', () => {
  let component: CashoversuccessComponent;
  let fixture: ComponentFixture<CashoversuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CashoversuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashoversuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
