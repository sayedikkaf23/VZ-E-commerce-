import { Component, OnInit } from '@angular/core';

interface Service {
  name: string;
  description: string;
  status: string; // Removed 'price'
}

@Component({
  selector: 'app-service-page',
  templateUrl: './service-page.component.html',
  styleUrls: ['./service-page.component.css']
})
export class ServicePageComponent implements OnInit {
  services: Service[] = [
    { name: 'Web Development', description: 'Full-stack web development services.', status: 'Active' },
    { name: 'SEO Optimization', description: 'Improve your website ranking.', status: 'Active' },
    { name: 'Graphic Design', description: 'Design logos, brochures, and more.', status: 'Inactive' },
    { name: 'App Development', description: 'Mobile app development services.', status: 'Active' }
  ];

  constructor() {}

  ngOnInit(): void {
    // No API needed for dummy data
  }
}
