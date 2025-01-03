import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlreadypaidComponent } from './alreadypaid.component';

describe('AlreadypaidComponent', () => {
  let component: AlreadypaidComponent;
  let fixture: ComponentFixture<AlreadypaidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlreadypaidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlreadypaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
