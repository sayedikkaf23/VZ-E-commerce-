import { Component } from '@angular/core';
declare const AOS: any;
declare const $: any;
@Component({
  selector: 'app-accounting-vat',
  standalone: true,
  imports: [],
  templateUrl: './accounting-vat.component.html',
  styleUrl: './accounting-vat.component.css'
})
export class AccountingVatComponent {

  ngAfterViewInit() {
    AOS.init(); // Initialize AOS animations

    // jQuery script to handle scrolling and toggles
    $(window).scroll(() => {
      const height = $(window).scrollTop();
      if (height > 50) {
        $('html').addClass('sticky');
      } else {
        $('html').removeClass('sticky');
      }
    });

    $(document).ready(() => {
      $('.scrollToTop').click((event: any) => {
        event.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        return false;
      });

      $('.navbar-toggle').click(() => {
        $('html').toggleClass('menu-show');
      });

      $('.header-menu-overlay').click(() => {
        $('html').removeClass('menu-show');
      });

      // $('.sub-menu-toggle').click(function () {
      //   $(this).parent().toggleClass('submenu_active');
      // });
    });
  }
}
