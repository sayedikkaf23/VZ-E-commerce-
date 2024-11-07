import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDetails2Component } from './show-details-2.component';

describe('ShowDetails2Component', () => {
  let component: ShowDetails2Component;
  let fixture: ComponentFixture<ShowDetails2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowDetails2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowDetails2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
