import { Directive, ElementRef, OnInit } from '@angular/core';
import intlTelInput from 'intl-tel-input';

@Directive({
  selector: '[appPhoneInput]'
})
export class PhoneInputDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const input = this.el.nativeElement;
    intlTelInput(input, {
      initialCountry: 'us',
      separateDialCode: true,
    });
  }
}
