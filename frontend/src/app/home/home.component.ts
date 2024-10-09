import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { UserService } from '../service/user.service'; // Import your UserService
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf and *ngFor

declare const $: any;
declare const AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterModule, HttpClientModule,CommonModule], // Make sure HttpClientModule is added here
  providers: [UserService], // Explicitly provide UserService in this component

})
export class HomeComponent implements OnInit {
  services: any[] = [];

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.loadServices(); // Fetch services when the component is initialized

    
  }

  loadServices(): void {
    this.userService.getServices().subscribe(
      (data) => {
        this.services = data;
        console.log('Services loaded:', this.services);
        AOS.refresh();  // This ensures AOS is properly initialized after dynamic content is loaded
      },
      (error) => {
        console.error('Error loading services:', error);
      }
    );
  }



  ngAfterViewInit() {
    AOS.init(); // Initialize AOS animations

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
  
  
  navigateToPage() {
    console.log('Navigation triggered');
    this.router.navigate(['/step-1']);
  }


  
}
