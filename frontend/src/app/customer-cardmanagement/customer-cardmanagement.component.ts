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
  uploadedFileNames: Array<Array<{ name: string; url: string }>> = [];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
    
  ) {
    this.selectedShareholders.forEach(() => this.uploadedFileNames.push([]));
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
  
  openFileInNewTab(fileUrl: string): void {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }
  
  openShareholderModal(shareholders: any[]): void {
    this.selectedShareholders = shareholders;
    this.showModal = true;
  }

  onFilesSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Get the selected files and create object URLs for each
      const files = Array.from(input.files);
      const fileUrls = files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));
  
      // Add the selected files to the shareholder's uploadedFiles array
      this.selectedShareholders[index].uploadedFiles = [
        ...(this.selectedShareholders[index].uploadedFiles || []),
        ...fileUrls
      ];
  
      // Optionally, clear the input field (to reset the input display)
      // input.value = ''; // This will reset the file input to make it look like a fresh file selection
    }
  }
  
  
  viewFile(fileUrl: string) {
    // Open the file in a new browser tab
    window.open(fileUrl, '_blank');
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
