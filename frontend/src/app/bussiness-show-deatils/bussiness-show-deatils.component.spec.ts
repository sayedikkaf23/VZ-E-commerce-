import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BussinessShowDeatilsComponent } from './bussiness-show-deatils.component';

describe('BussinessShowDeatilsComponent', () => {
  let component: BussinessShowDeatilsComponent;
  let fixture: ComponentFixture<BussinessShowDeatilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BussinessShowDeatilsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BussinessShowDeatilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
