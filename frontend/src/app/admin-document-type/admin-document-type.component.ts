import { Component } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service'; 
import { UserService } from '../service/user.service';


@Component({
  selector: 'app-admin-document-type',
  templateUrl: './admin-document-type.component.html',
  styleUrl: './admin-document-type.component.css'
})
export class AdminDocumentTypeComponent {



docTypes: string[] = [];
tempDocTypes: string[] = [];
  mailList: any[] = []; // To store fetched mail data
  selectedDocDetails: any[] = []; // To store selected mail details
  showModal: boolean = false; // Flag to control modal visibility
 
  serviceList: any[] = [];
documentTypeInput: any;
  selectedServiceName: any;

  docTypesMap: { [key: string]: string[] } = {};
  selectedCount: number | null = null;
  

  
  
    constructor(private adminAuthService: AdminAuthService, private userService: UserService) {}
  
    ngOnInit(): void {
     
      this.loadServices();
    }

    trackByIndex(index: number, item: any): number {
      return index;
    }
    


  loadServices(): void {
    this.userService.getServices().subscribe(
      (data) => {
        // Filter active services and sort by order
        this.serviceList = data
          .filter((service: { isActive: any; }) => service.isActive);  // Only include active services
             // Sort by the order field in ascending order
  
            },
            (error) => {
              console.error('Error fetching user details:', error);
            }
          );
  }

  openDocType(serviceName: string): void {
    this.selectedServiceName = serviceName;

    // Reset the docTypes array for the add modal
    this.docTypes = [];
    this.selectedCount = null;

    this.showModal = true;
    const modalElement = document.getElementById('docTypeModal');
    if (modalElement) {
      modalElement.style.display = 'block'; // Show modal
      modalElement.classList.add('show'); // Add 'show' class
    }

     // Add blur effect to the main content
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.classList.add('blurred');
  }

  }


  openEditDocType(serviceName: string): void {
    this.selectedServiceName = serviceName;

    this.docTypes = this.docTypesMap[serviceName] || [];
    this.showModal = true;
    const modalElement = document.getElementById('editDocTypeModal');
    if (modalElement) {
      modalElement.style.display = 'block'; // Show modal
      modalElement.classList.add('show'); // Add 'show' class
    }

     // Add blur effect to the main content
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.classList.add('blurred');
  }

  }

  closeAddModal(): void {
    const modalElement = document.getElementById('docTypeModal');
    if (modalElement) {
      modalElement.style.display = 'none'; // Hide the modal
      modalElement.classList.remove('show'); // Remove the "show" class
    }

    this.selectedCount = null; // Reset the dropdown value
  this.docTypes = []; // Clear the text box list

  // Remove blur effect from the main content
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.classList.remove('blurred');
  }
  }

  closeEditModal(): void {

    if (this.selectedServiceName) {
      // Reset docTypes to the original values from docTypesMap
      this.docTypes = this.docTypesMap[this.selectedServiceName]
        ? [...this.docTypesMap[this.selectedServiceName]]
        : [];
    }

    const modalElement = document.getElementById('editDocTypeModal');
    if (modalElement) {
      modalElement.style.display = 'none'; // Hide the modal
      modalElement.classList.remove('show'); // Remove the "show" class
    }

     // Remove blur effect from the main content
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.classList.remove('blurred');
  }
  }

   // Method triggered when dropdown value changes
   updateDocType(): void {
    const count = Number(this.selectedCount) || 0;

    // Adjust the docTypes array size based on the selected count
    if (count > this.docTypes.length) {
      this.docTypes = [...this.docTypes, ...Array(count - this.docTypes.length).fill('')];
    } else {
      this.docTypes = this.docTypes.slice(0, count);
    }
  }

  // Method to delete a specific document type
  deleteDocType(index: number): void {
    this.docTypes.splice(index, 1); // Remove the specific item
    this.selectedCount = this.docTypes.length; // Update the count accordingly
  }

  submitDocuments(): void {
    if (this.selectedServiceName) {
      // Check if there are existing docTypes for the selected service
      if (!this.docTypesMap[this.selectedServiceName]) {
        // If not, initialize an empty array
        this.docTypesMap[this.selectedServiceName] = [];
      }

      // Remove blur effect from the main content
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.classList.remove('blurred');
  }
  
      // Append new docTypes to the existing ones
      this.docTypesMap[this.selectedServiceName] = [
        ...this.docTypesMap[this.selectedServiceName],
        ...this.docTypes
      ];
  
      // Clear the current modal input and close it
      this.docTypes = [];
      this.selectedCount= null;

      const modalElement = document.getElementById('docTypeModal');
      if (modalElement) {
        modalElement.style.display = 'none'; // Close the modal
        modalElement.classList.remove('show'); // Remove "show" class
      }
    }
  }


  submitEditDocuments(): void {
    if (this.selectedServiceName) {
      // Update docTypes for the specific service in the map
      this.docTypesMap[this.selectedServiceName] = [...this.docTypes];

      // Remove blur effect from the main content
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.classList.remove('blurred');
  }
  
      // Close the edit modal
      const editModalElement = document.getElementById('editDocTypeModal');
      if (editModalElement) {
        editModalElement.style.display = 'none'; // Hide the modal
        editModalElement.classList.remove('show'); // Remove "show" class
      }
  
      // Optionally, reset docTypes if needed for next usage
      this.docTypes = [];
    }
  }


}
