import { Component } from '@angular/core';
declare const $: any;
declare const AOS: any;

@Component({
  selector: 'app-sm',
  standalone: true,
  imports: [],
  templateUrl: './sm.component.html',
  styleUrl: './sm.component.css',
})
export class SmComponent {
  ngAfterViewInit() {
    AOS.init();

    $(window).scroll(function () {
      var height = $(window).scrollTop();
      if (height > 50) {
        $('html').addClass('sticky');
      } else {
        $('html').removeClass('sticky');
      }
    });
    $(document).ready(function () {
      $('.scrollToTop').click(function (event: any) {
        event.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        return false;
      });

      $('.navbar-toggle').click(function () {
        $('html').toggleClass('menu-show');
      });
      $('.header-menu-overlay').click(function () {
        $('html').removeClass('menu-show');
      });
      $('.sub-menu-toggle').click(function () {
        // $(this).parent().toggleClass('submenu_active');
      });
    });
  }
}
