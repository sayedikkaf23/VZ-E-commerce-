
import { Component, OnInit } from '@angular/core';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-alreadypaid',
  templateUrl: './alreadypaid.component.html',
  styleUrl: './alreadypaid.component.css'
})
export class AlreadypaidComponent {
  message: string = '';

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.messageService.message$.subscribe(message => {
      this.message = message;
      
      setTimeout(() => {
        alert (message || "You have already paid for the Proforma Invoice. Please contact your sales agent for more information.");

      }, 1000);
  
    });
  }
}
