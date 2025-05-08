import { Component, Input, Output, EventEmitter, HostListener , ElementRef } from '@angular/core';

@Component({
  selector: 'app-searchable-nationality-dropdown',
  templateUrl: './searchable-nationality-dropdown.component.html',
  styleUrl: './searchable-nationality-dropdown.component.scss'
})
export class SearchableNationalityDropdownComponent {
  @Input() list: any[] = [];
  @Input() labelKey: string = 'country'; // or 'common'
  @Input() placeholder: string = 'Select Nationality';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  shown = false;
  keyword = '';
  filteredList: any[] = [];
  constructor(private eRef: ElementRef) {}


  ngOnInit() {
    this.filteredList = [...this.list];
  }

  show() {
    this.shown = !this.shown;
    this.keyword = '';
    this.filteredList = [...this.list];
  }

  search(keyword: string) {
    this.filteredList = this.list.filter(item =>
      item[this.labelKey].toLowerCase().startsWith(keyword.toLowerCase())
    );
  }

  select(item: any) {
    this.value = item[this.labelKey];
    this.valueChange.emit(this.value);
    this.shown = false;
  }

  @HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  if (!this.eRef.nativeElement.contains(event.target)) {
    this.shown = false;
  }
}

// Optional: support mobile touches too
@HostListener('document:touchstart', ['$event'])
onTouchOutside(event: TouchEvent) {
  if (!this.eRef.nativeElement.contains(event.target)) {
    this.shown = false;
  }
}
}
