import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { UserService } from '../service/user.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';

declare const $: any;
declare const AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterModule, HttpClientModule, CommonModule],
  providers: [UserService],
})
export class HomeComponent implements OnInit {
  services: any[] = [];

  constructor(private router: Router, private userService: UserService, private cdRef: ChangeDetectorRef, private zone: NgZone) {}

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
    const target = event.target as HTMLElement;

    // Check if the clicked element has the class 'btn'
    if (target && target.classList.contains('btn')) {
      const href = target.getAttribute('href');

      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        // Open external links using window.location or window.open
        window.open(href, '_blank');
      } else {
        // For internal links, use Angular's router
        this.router.navigate(['/step-1']);
      }

      event.preventDefault(); // Prevent default behavior of anchor tags
    }
  }

  ngAfterViewInit() {
    AOS.init();

    $(window).scroll(function () {
      const height = $(window).scrollTop();
      if (height > 50) {
        $('html').addClass('sticky');
      } else {
        $('html').removeClass('sticky');
      }
    });

    $(document).ready( () => {
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
