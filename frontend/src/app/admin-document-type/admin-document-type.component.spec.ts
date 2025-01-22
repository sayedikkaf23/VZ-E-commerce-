import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDocumentTypeComponent } from './admin-document-type.component';

describe('AdminDocumentTypeComponent', () => {
  let component: AdminDocumentTypeComponent;
  let fixture: ComponentFixture<AdminDocumentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminDocumentTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
