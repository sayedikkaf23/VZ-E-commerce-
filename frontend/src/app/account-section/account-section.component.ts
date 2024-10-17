import { Component, AfterViewInit, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { AppComponent } from '../app.component'; // Standalone component
import AOS from 'aos';
import { isPlatformBrowser } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-account-section',
  templateUrl: './account-section.component.html',
  styleUrl: './account-section.component.css'
})
export class AccountSectionComponent implements OnInit, AfterViewInit {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const topElement = document.querySelector('.account_section');
        if (topElement) {
          topElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }, 100); // Added a small timeout to ensure the page is fully loaded
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
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
      });
    }
  }

  navigateToStep1() {
    this.router.navigate(['/step-2']); // Adjust the route according to your setup
  }
}
