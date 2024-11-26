import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css'],
})
export class UserHomeComponent implements OnInit {
  username: string = 'John Doe';

  recentActivities = [
    { date: '2024-11-25', description: 'Completed project milestone' },
    { date: '2024-11-24', description: 'Updated account settings' },
    { date: '2024-11-23', description: 'Joined a new project' },
  ];

  notifications = [
    { message: 'New comment on your post.', timestamp: '2024-11-25 10:00 AM' },
    { message: 'Task deadline approaching.', timestamp: '2024-11-24 02:15 PM' },
    { message: 'Project approved.', timestamp: '2024-11-23 05:30 PM' },
  ];

  ngOnInit(): void {}
}
