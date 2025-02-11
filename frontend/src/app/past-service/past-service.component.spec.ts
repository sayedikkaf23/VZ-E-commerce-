import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastServiceComponent } from './past-service.component';

describe('PastServiceComponent', () => {
  let component: PastServiceComponent;
  let fixture: ComponentFixture<PastServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PastServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PastServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
