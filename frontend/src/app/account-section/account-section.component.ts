import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { AppComponent } from '../app.component'; // Standalone component
declare const AOS: any;
declare const $: any;

@Component({
  selector: 'app-account-section',
  templateUrl: './account-section.component.html',
  styleUrls: ['./account-section.component.css'], 
  standalone: true, // Make this standalone if needed
  imports: [AppComponent] // Import standalone component

})
export class AccountSectionComponent implements AfterViewInit {
  constructor(private router: Router) {} 

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
  navigateToStep1() {
    this.router.navigate(['/step-2']); // Adjust the route according to your setup
  }
}
