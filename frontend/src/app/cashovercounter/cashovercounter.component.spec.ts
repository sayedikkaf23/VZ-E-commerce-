import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashovercounterComponent } from './cashovercounter.component';

describe('CashovercounterComponent', () => {
  let component: CashovercounterComponent;
  let fixture: ComponentFixture<CashovercounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CashovercounterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashovercounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
