import { ComponentFixture, TestBed } from '@angular/core/testing';

import { _HomeComponent } from './home.component';

describe('_HomeComponent', () => {
  let component: _HomeComponent;
  let fixture: ComponentFixture<_HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [_HomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(_HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
