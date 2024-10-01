import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare const AOS: any;
declare const $: any;
@Component({
  selector: 'app-step-1',
  standalone: true,
  imports: [],
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.css',
})
export class Step1Component {
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
  onSubmit() {
    // Navigate to the next page directly when the form is submitted
    this.router.navigate(['/step-2']); // Adjust the route to your target page
  }
}
