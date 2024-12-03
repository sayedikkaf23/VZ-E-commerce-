import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequedepositComponent } from './chequedeposit.component';

describe('ChequedepositComponent', () => {
  let component: ChequedepositComponent;
  let fixture: ComponentFixture<ChequedepositComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChequedepositComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChequedepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
