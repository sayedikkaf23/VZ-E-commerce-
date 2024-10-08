import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GolderVisaComponent } from './golder-visa.component';

describe('GolderVisaComponent', () => {
  let component: GolderVisaComponent;
  let fixture: ComponentFixture<GolderVisaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GolderVisaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GolderVisaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
