import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[handleClick]'  // This is the selector you'll use in the template
})
export class HandleClickDirective {
  @Output() handleClick: EventEmitter<MouseEvent> = new EventEmitter();

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent): void {
    this.handleClick.emit(event);
  }
}
