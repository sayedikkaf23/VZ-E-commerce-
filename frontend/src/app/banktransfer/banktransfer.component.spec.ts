import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanktransferComponent } from './banktransfer.component';

describe('BanktransferComponent', () => {
  let component: BanktransferComponent;
  let fixture: ComponentFixture<BanktransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BanktransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BanktransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
