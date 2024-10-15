import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, ChangeDetectorRef, NgZone, Inject, PLATFORM_ID } from '@angular/core';

import AOS from 'aos';

declare var $: any;

@Component({
  selector: 'app-show-details',
  templateUrl: './show-details.component.html',
  styleUrl: './show-details.component.css'
})
export class ShowDetailsComponent {

  isBrowser: boolean;

  constructor( private cdRef: ChangeDetectorRef, private zone: NgZone, @Inject(PLATFORM_ID) private platformId: Object) {
    // Check if the platform is browser
    this.isBrowser = isPlatformBrowser(this.platformId);
  }






  ngAfterViewInit(): void {
    if (this.isBrowser) {  // Check if it's running in the browser
      AOS.init();

      $(window).scroll(function () {
        const height = $(window).scrollTop();
        if (height > 50) {
          $('html').addClass('sticky');
        } else {
          $('html').removeClass('sticky');
        }
      });

      $(document).ready(() => {
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

        $('.sub-menu-toggle').click( () => {
          $(this).parent().toggleClass('submenu_active');
        });
      });
    }
  }
}
