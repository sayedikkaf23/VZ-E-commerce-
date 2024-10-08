import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailManagementComponent } from './mail-management.component';

describe('MailManagementComponent', () => {
  let component: MailManagementComponent;
  let fixture: ComponentFixture<MailManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MailManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
