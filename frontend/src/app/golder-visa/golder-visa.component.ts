import { Component } from '@angular/core';
declare const AOS: any;
declare const $: any;
@Component({
  selector: 'app-golder-visa',
  standalone: true,
  imports: [],
  templateUrl: './golder-visa.component.html',
  styleUrl: './golder-visa.component.css'
})
export class GolderVisaComponent {

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
