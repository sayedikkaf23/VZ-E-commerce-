import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchableNationalityDropdownComponent } from './searchable-nationality-dropdown.component';

describe('SearchableNationalityDropdownComponent', () => {
  let component: SearchableNationalityDropdownComponent;
  let fixture: ComponentFixture<SearchableNationalityDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchableNationalityDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchableNationalityDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
