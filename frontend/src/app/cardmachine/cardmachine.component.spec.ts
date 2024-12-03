import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardmachineComponent } from './cardmachine.component';

describe('CardmachineComponent', () => {
  let component: CardmachineComponent;
  let fixture: ComponentFixture<CardmachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardmachineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardmachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
