import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.css'] // Fixed typo here
})
export class HelpCenterComponent {
  constructor(private router: Router) {} // Properly closed constructor

  goToPastService(): void {
    this.router.navigate(['/user/pastservice']);
    console.log("clicked");
  }

  goToDashbordService(): void {
    this.router.navigate(['user/dashboard']);
  }
  
}
