import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

declare const $: any;
declare const AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterModule], 
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToPage(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/step-1']);
  }

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
