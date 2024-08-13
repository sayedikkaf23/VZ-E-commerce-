import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmComponent } from './sm.component';

describe('SmComponent', () => {
  let component: SmComponent;
  let fixture: ComponentFixture<SmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
