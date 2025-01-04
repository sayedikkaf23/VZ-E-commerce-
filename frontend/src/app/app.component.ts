import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';

  // List of routes where dynamic scripts and styles should be loaded
  specialRoutes: string[] = [
    '/onlinepayment',
    '/failure',
    '/successful',
    '/onlinepayments',
    '/cardmachine',
    '/cashovercounter',
    '/cashover-counter',
    '/success',
    '/cashcountersuccess',
    '/cashdeposit',
    '/banktransfer',
  ];

  // Arrays to store dynamically added scripts and styles
  dynamicScripts: string[] = [
    'https://code.jquery.com/jquery-2.2.4.min.js',
    'assets/js/bootstrap.bundle.min.js',
    'assets/js/simplebar.min.js',
    'assets/js/select2.min.js',
    'https://kit.fontawesome.com/f5e65f7743.js',
    'assets/js/jquery.uploadfile.min.js',
  ];

  dynamicStyles: string[] = [
    'assets/css/bootstrap.min.css',
    'assets/css/simplebar.min.css',
    'assets/css/select2.min.css',
    'assets/fonts/stylesheet.css',
    'assets/css/style.css',
    'assets/css/stylepay.css',
    'assets/css/responsive.css',
    'assets/css/uploadfile.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
    'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://hayageek.github.io/jQuery-Upload-File/4.0.11/uploadfile.css',
  ];

  currentRoute: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to router events to dynamically load/remove assets based on the route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.loadAssets();
      });


      
  }

  ngOnDestroy(): void {
    // Remove assets when the component is destroyed
    this.removeAssets();
  }

  /**
   * Load dynamic scripts and styles
   */
  private loadAssets(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check if the current route matches one of the special routes
      const isSpecialRoute = this.specialRoutes.some((route) =>
        this.currentRoute.startsWith(route)
      );

      if (!isSpecialRoute) {
        return;
      }

      // Load scripts and styles
      this.dynamicScripts.forEach((src) => this.loadScript(src));
      this.dynamicStyles.forEach((href) => this.loadStyle(href));
    }
  }

  /**
   * Remove dynamic scripts and styles
   */
  private removeAssets(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.dynamicScripts.forEach((src) => this.removeScript(src));
      this.dynamicStyles.forEach((href) => this.removeStyle(href));
    }
  }

  /**
   * Dynamically add a script to the document
   */
  private loadScript(src: string): void {
    if (isPlatformBrowser(this.platformId)) {
      // Avoid loading the script multiple times
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.async = true;
        script.onload = () => console.log(`${src} loaded successfully.`);
        script.onerror = () => console.error(`Failed to load script: ${src}`);
        document.body.appendChild(script);
      } else {
        console.log(`${src} is already loaded.`);
      }
    }
  }

  /**
   * Dynamically remove a script from the document
   */
  private removeScript(src: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const script = document.querySelector(`script[src="${src}"]`);
      if (script) {
        script.remove();
        console.log(`${src} removed successfully.`);
      }
    }
  }

  /**
   * Dynamically add a style to the document
   */
  private loadStyle(href: string): void {
    if (isPlatformBrowser(this.platformId)) {
      // Avoid loading the style multiple times
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => console.log(`${href} loaded successfully.`);
        link.onerror = () => console.error(`Failed to load style: ${href}`);
        document.head.appendChild(link);
      } else {
        console.log(`${href} is already loaded.`);
      }
    }
  }

  /**
   * Dynamically remove a style from the document
   */
  private removeStyle(href: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const link = document.querySelector(`link[href="${href}"]`);
      if (link) {
        link.remove();
        console.log(`${href} removed successfully.`);
      }
    }
  }
}
