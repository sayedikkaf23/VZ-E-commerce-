import { Component, HostListener, ChangeDetectorRef, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { isPlatformBrowser } from '@angular/common';
import AOS from 'aos';

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class _HomeComponent {

  services: any[] = [];
  isBrowser: boolean;

  constructor(private router: Router, private userService: UserService, private cdRef: ChangeDetectorRef, private zone: NgZone, @Inject(PLATFORM_ID) private platformId: Object) {
    // Check if the platform is browser
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.userService.getServices().subscribe(
      (data) => {
        this.services = data;
        console.log('Services loaded:', this.services);
        this.cdRef.detectChanges();
      },
      (error) => {
        console.error('Error loading services:', error);
      }
    );
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event): void {
    if (this.isBrowser) {  // Check if the code is running on the browser
      const target = event.target as HTMLElement;

      if (target && target.classList.contains('btn')) {
        const href = target.getAttribute('href');

        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          window.open(href, '_blank');
        } else {
          this.router.navigate(['/step-1']);
        }

        event.preventDefault();
      }
    }
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

        $('.sub-menu-toggle').click(() => {
          $(this).parent().toggleClass('submenu_active');
        });
      });
    }
  }
}
