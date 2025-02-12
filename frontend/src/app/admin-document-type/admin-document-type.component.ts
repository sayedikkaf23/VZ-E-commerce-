import { Component } from '@angular/core';
import { AdminAuthService } from '../service/admin-auth.service';
import { DocumenttypeService } from '../service/documenttype.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-admin-document-type',
  templateUrl: './admin-document-type.component.html',
  styleUrl: './admin-document-type.component.css',
})
export class AdminDocumentTypeComponent {
  docTypes: string[] = [];
  tempDocTypes: string[] = [];
  mailList: any[] = []; // To store fetched mail data
  selectedDocDetails: any[] = []; // To store selected mail details
  showModal: boolean = false; // Flag to control modal visibility
  docRecords: any[] = []; // Stores full response objects including _id

  serviceList: any[] = [];
  documentTypeInput: any;
  selectedServiceName: any;

  docTypesMap: { [key: string]: string[] } = {};
  selectedCount: number | null = null;

  constructor(
    private adminAuthService: AdminAuthService,
    private userService: UserService,
    private documenttypeService: DocumenttypeService
  ) {}

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
        this.serviceList = data.filter(
          (service: { isActive: any }) => service.isActive
        ); // Only include active services
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
  
    // Fetch document types based on the service name
    switch (serviceName) {
      case 'Bank Account Opening':
        this.documenttypeService.getPersonalBanks().subscribe(
          (response: any[]) => {
            this.docRecords = response; // Store the full objects
            this.docTypes = response.map((item) => item.documentType); // Extract the documentType field
            this.selectedCount = this.docTypes.length;
          },
          (error) => {
            console.error('Error fetching Personal Banks:', error);
            this.docRecords = []; // Fallback in case of an error
            this.docTypes = []; // Fallback in case of an error
          }
        );
        break;

      // case 'Business Bank':
      //   this.documenttypeService.getBusinessBanks().subscribe(
      //     (response: any[]) => {
      //       this.docTypes = response.map((item) => item.documentType);
      //     },
      //     (error) => {
      //       console.error('Error fetching Business Banks:', error);
      //       this.docTypes = [];
      //     }
      //   );
      //   break;

      case 'Virtual Receptionist':
        this.documenttypeService.getVirtualReceptions().subscribe(
          (response: any[]) => {
            this.docRecords = response; // Store the full objects
            this.docTypes = response.map((item) => item.documentType);
            this.selectedCount = this.docTypes.length;

          },
          (error) => {
            console.error('Error fetching Virtual Receptions:', error);
            this.docTypes = [];
            this.docRecords = []; // Fallback in case of an error
          }
        );
        break;

      case 'Mail Management':
        this.documenttypeService.getMailManagements().subscribe(
          (response: any[]) => {
            this.docRecords = response; // Store the full objects
            this.docTypes = response.map((item) => item.documentType);
            this.selectedCount = this.docTypes.length;
          },
          (error) => {
            console.error('Error fetching Mail Managements:', error);
            this.docTypes = [];
            this.docRecords = []; // Fallback in case of an error
          }
        );
        break;

      default:
        console.warn('Unknown service name:', serviceName);
        this.docTypes = [];
        this.selectedCount = 0;
        break;
    }

    // Show the modal
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
      this.docTypes = [
        ...this.docTypes,
        ...Array(count - this.docTypes.length).fill(''),
      ];
    } else {
      this.docTypes = this.docTypes.slice(0, count);
    }
  }

  // Method to delete a specific document type
  deleteDocType(index: number): void {
    if (index > -1) {
      this.docTypes.splice(index, 1); // Remove from docTypes array
      this.docRecords.splice(index, 1); // Also remove the corresponding record from docRecords
    }
    this.selectedCount = this.docTypes.length; // Update the count accordingly
  }

  submitDocuments(): void {
    if (this.selectedServiceName) {
      // Check if there are existing docTypes for the selected service
      if (!this.docTypesMap[this.selectedServiceName]) {
        // If not, initialize an empty array
        this.docTypesMap[this.selectedServiceName] = [];
      }

      // Append new docTypes to the existing ones
      this.docTypesMap[this.selectedServiceName] = [
        ...this.docTypesMap[this.selectedServiceName],
        ...this.docTypes,
      ];

      // console.log(this.docTypesMap, 'docTypesMap');

      // Call the corresponding API based on the selected service name
      switch (this.selectedServiceName) {
        case 'Bank Account Opening':
          this.documenttypeService.createPersonalBank(this.docTypes).subscribe(
            (response) => {
              console.log('Bank Account Opening API Response:', response);
            },
            (error) => {
              console.error('Error:', error);
            }
          );
          break;

        // case 'Accounting & VAT':
        //   this.documenttypeService.createBusinessBank(this.docTypes).subscribe(
        //     (response) => {
        //       console.log('Accounting & VAT API Response:', response);
        //     },
        //     (error) => {
        //       console.error('Error:', error);
        //     }
        //   );
        //   break;

        case 'Virtual Receptionist':
          this.documenttypeService
            .createVirtualReception(this.docTypes)
            .subscribe(
              (response) => {
                console.log('Virtual Receptionist API Response:', response);
              },
              (error) => {
                console.error('Error:', error);
              }
            );
          break;

        case 'Mail Management':
          this.documenttypeService
            .createMailManagement(this.docTypes)
            .subscribe(
              (response) => {
                console.log('Mail Management API Response:', response);
              },
              (error) => {
                console.error('Error:', error);
              }
            );
          break;

        default:
          console.warn(
            'No matching service found for:',
            this.selectedServiceName
          );
          break;
      }

      // Clear the current modal input and close it
      this.docTypes = [];
      this.selectedCount = null;

      const modalElement = document.getElementById('docTypeModal');
      if (modalElement) {
        modalElement.style.display = 'none'; // Close the modal
        modalElement.classList.remove('show'); // Remove "show" class
      }

      // Remove blur effect from the main content
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.classList.remove('blurred');
      }
    }
  }

  submitEditDocuments(): void {
    if (!this.selectedServiceName || !this.docRecords.length) {
      console.warn('No service selected or no document records available.');
      return;
    }
  
    // Build the payload with _id and updated documentType
    const updatedData = this.docRecords.map((record, index) => ({
      id: record._id,                // Use the existing _id from the stored records
      documentType: this.docTypes[index], // Updated or original documentType
      isActive: record.isActive,     // Include isActive if needed
    }));
    // .filter(item => item.id && item.documentType); // Remove entries where `documentType` is missing
    console.log('Updated docTypes:', this.docTypes);
    console.log('updatedData before sending:', JSON.stringify(updatedData, null, 2));


    // Call the appropriate update API based on the selected service name
    switch (this.selectedServiceName) {
      case 'Bank Account Opening':
        this.documenttypeService.updatePersonalBank(updatedData).subscribe(
          (response) => {
            console.log('Personal Bank updated successfully:', response);
                      },
          (error) => {
            console.error('Error updating Personal Bank:', error);
          }
        );
        break;
  
      case 'Virtual Receptionist':
        this.documenttypeService.updateVirtualReception(updatedData).subscribe(
          (response) => {
            console.log('Virtual Reception updated successfully:', response);
          },
          (error) => {
            console.error('Error updating Virtual Reception:', error);
          }
        );
        break;
  
      case 'Mail Management':
        this.documenttypeService.updateMailManagement(updatedData).subscribe(
          (response) => {
            console.log('Mail Management updated successfully:', response);
          },
          (error) => {
            console.error('Error updating Mail Management:', error);
          }
        );
        break;
  
      default:
        console.warn('No matching service found for:', this.selectedServiceName);
        return;
    }
  
    // Remove blur effect and close the modal
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('blurred');
    }
  
    const editModalElement = document.getElementById('editDocTypeModal');
    if (editModalElement) {
      editModalElement.style.display = 'none';
      editModalElement.classList.remove('show');
    }
  
    // Optionally clear the records and types for next usage
    this.docRecords = [];
    this.docTypes = [];
  }
  
}
