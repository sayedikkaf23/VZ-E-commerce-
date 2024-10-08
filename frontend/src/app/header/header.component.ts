import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void { }

  back() {
    history.back();
  }

  toggleSideBar() {
    const bodyElement = document.body;
    bodyElement.classList.toggle('sidebar-collapsein');
  }

  logOut() {
    localStorage.clear();
    location.href = '/admin/login';
    location.reload();
    // this.router.navigate(['/admin/login']);
  }

  



  downloadLogs() {
    console.log("dowload")
  }

}
