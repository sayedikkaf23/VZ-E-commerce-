import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailerComponent } from './failer.component';

describe('FailerComponent', () => {
  let component: FailerComponent;
  let fixture: ComponentFixture<FailerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FailerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FailerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
