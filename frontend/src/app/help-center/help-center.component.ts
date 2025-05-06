import { Component , ElementRef, Renderer2,PLATFORM_ID, Inject} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.css'] // Fixed typo here
})
export class HelpCenterComponent {
   private sidebarIcon!: HTMLElement;
  private listenerFn!: () => void;
  constructor(private router: Router,  @Inject(PLATFORM_ID) private platformId: object, private renderer: Renderer2, private el: ElementRef) {} // Properly closed constructor

  ngOnInit(){
    if (isPlatformBrowser(this.platformId)) {
        document.body.classList.add('admin_body');
      }
  }
  ngAfterViewInit() {
    // Remove 'menu-hide' on component initialization
    this.renderer.removeClass(document.body, 'menu-hide');
  
    // Sidebar toggle for desktop
    this.sidebarIcon = this.el.nativeElement.querySelector('.sidebar_icon');
    if (this.sidebarIcon) {
      this.renderer.listen(this.sidebarIcon, 'click', () => {
        this.toggleSidebar();
      });
    }
  
    // Sidebar toggle for mobile (navbar-toggle)
    const navbarToggle = this.el.nativeElement.querySelector('.navbar-toggle');
    if (navbarToggle) {
      this.renderer.listen(navbarToggle, 'click', () => {
        if (navbarToggle.classList.contains('active')) {
          this.renderer.removeClass(navbarToggle, 'active');
        } else {
          this.renderer.addClass(navbarToggle, 'active');
        }
      });
    }
  }
  
  // Helper method to toggle sidebar
  toggleSidebar() {
    if (document.body.classList.contains('menu-hide')) {
      this.renderer.removeClass(document.body, 'menu-hide');
    } else {
      this.renderer.addClass(document.body, 'menu-hide');
    }
  }

  goToPastService(): void {
    this.router.navigate(['/user/pastservice']);
    console.log("clicked");
  }
  goToHelp(): void {
    this.router.navigate(['/user/helpcenter']);
    console.log("clicked");
  }

  goToDashbordService(): void {
    this.router.navigate(['user/dashboard']);
  }
  navigateLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('admin_body'); // Remove the class before navigating
    }
    this.router.navigate(['/login']); // Navigate to login
  }

  ngOnDestroy() {
    // Remove event listener when component is destroyed
    if (this.listenerFn) {
      this.listenerFn();
    }
  }

  
}
