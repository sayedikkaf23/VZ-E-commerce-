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

     // Select the sidebar toggle button
     this.sidebarIcon = this.el.nativeElement.querySelector('.sidebar_icon');
 
     if (this.sidebarIcon) {
       // Use Renderer2 to add the event listener
       this.listenerFn = this.renderer.listen(this.sidebarIcon, 'click', () => {
         if (document.body.classList.contains('menu-hide')) {
           this.renderer.removeClass(document.body, 'menu-hide');
         } else {
           this.renderer.addClass(document.body, 'menu-hide');
         }
       });
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
