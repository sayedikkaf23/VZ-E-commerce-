import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashdepositComponent } from './cashdeposit.component';

describe('CashdepositComponent', () => {
  let component: CashdepositComponent;
  let fixture: ComponentFixture<CashdepositComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CashdepositComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashdepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
