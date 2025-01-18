import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

interface Service {
  name: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-customer-cardmanagement',
  templateUrl: './customer-cardmanagement.component.html',
  styleUrls: ['./customer-cardmanagement.component.css'], // Fix the styleUrls property
})
export class CustomerCardmanagementComponent implements OnInit {


  services: Service[] = []; // Initialize an empty array for services
  records: any[] = [];
  selectedRecord: any = null; // Initialize to null
  isSidebarActive = false;
  userName: string = ''; // Property to store the user's name
  showModal = false;
  
  // Will store the shareholders to display in the modal
  selectedShareholders: any[] = [];
  selectedDocumentType: string = ''; // Stores the selected document type
  uploadedFiles: { name: string; url: string; type: string }[] = []; // Stores uploaded files with their document types



  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
    
  ) {
   
  }

  ngOnInit(): void {
    console.log('Current Route:', this.route.snapshot.url); // Check the current URL

    // Retrieve the email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      // Call the API with the email
      this.fetchUserServices(email);
      this.userName = this.extractNameFromEmail(email);
    } else {
      console.error('No email found in localStorage.');
    }
  }
  extractNameFromEmail(email: string): string {
    return email.split('@')[0]; // Get the part before the '@' symbol
  }
  ngAfterViewInit() {
    document.body.style.paddingTop = '0px';
    document.documentElement.style.paddingTop = '0px';
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  fetchUserServices(email: string): void {
    const payload = { email };

    this.userService.fetchUserServices(payload).subscribe(
      (response) => {
        if (response && response.data) {
          console.log('Response Data:', response.data);
          this.records = response.data;
        }
      },
      (error) => {
        console.error('Error fetching user services:', error);
      }
    );
  }

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }

  closeSidebar() {
    this.isSidebarActive = false;
  }

  viewDetails(record: any): void {
    this.selectedRecord = record; // Set the selected record
  
    // Combine product arrays
    this.selectedRecord.combinedProducts = [
      ...(record.quoteWithProductDetails?.product || []),
      ...(record.salesforceResponseMatchScreening?.products || [])
    ];
  
    // Calculate totals
    const subTotal = this.selectedRecord.combinedProducts.reduce((sum: number, product: any) => {
      const quantity = product.productQuantity || product.productQunatity || 0;
      const unitPrice = product.productUnitPrice || 0;
      return sum + quantity * unitPrice;
    }, 0);
  
    const vat = subTotal * 0.05; // Assuming VAT is 5%
    const totalIncludingVAT = subTotal + vat;
  
    // Set calculated values
    this.selectedRecord.calculatedSubTotal = subTotal;
    this.selectedRecord.calculatedVAT = vat;
    this.selectedRecord.calculatedTotalIncludingVAT = totalIncludingVAT;
  
    console.log(this.selectedRecord);
  
    const modalElement = document.getElementById('detailsModal');
    if (modalElement) {
      // Use the Bootstrap modal
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  uploadDetailsModal() {
    const modalElement = document.getElementById('uploadDetailsModal');
    if (modalElement) {
      // Use the Bootstrap modal
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }


  openFileInNewTab(fileUrl: string): void {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }
  
  openShareholderModal(shareholders: any[]): void {
    this.selectedShareholders = shareholders;
    this.showModal = true;
  }



   // Handles file selection
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      // Prevent upload if no document type is selected
      if (!this.selectedDocumentType) {
        alert('Please select a document type before uploading files.');
        return;
      }

      const files = Array.from(input.files);
      const fileUrls = files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file), // Generate URL for the file
        type: this.selectedDocumentType, // Lock the document type for this file
      }));

      // Append selected files to the uploadedFiles array
      this.uploadedFiles = [...this.uploadedFiles, ...fileUrls];

      // Reset the file input field
      input.value = '';
    }
  }

  // Placeholder for file viewing logic
  viewFile(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }
  
  // Removes a specific file from the list
  removeFile(fileToRemove: { name: string; url: string; type: string }): void {
    this.uploadedFiles = this.uploadedFiles.filter(
      (file) => file.url !== fileToRemove.url
    );
  }

  
  
  

  closeModal(): void {
    this.showModal = false;
  }

  closeModalOutside(event: MouseEvent): void {
    // Closes the modal if the user clicks the backdrop
    this.showModal = false;
  }
  navigateLogout(): void {
    this.router.navigate(['/login']); // Navigate to login
  }
}
