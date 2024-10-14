import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackAccountOpeningComponent } from './back-account-opening.component';

describe('BackAccountOpeningComponent', () => {
  let component: BackAccountOpeningComponent;
  let fixture: ComponentFixture<BackAccountOpeningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackAccountOpeningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackAccountOpeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
