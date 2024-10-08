import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateIncorporationComponent } from './certificate-incorporation.component';

describe('CertificateIncorporationComponent', () => {
  let component: CertificateIncorporationComponent;
  let fixture: ComponentFixture<CertificateIncorporationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateIncorporationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CertificateIncorporationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
