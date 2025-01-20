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

  documentTypeOptions: string[] = []; // Options for the dropdown
  selectedIndex: number = 0;


  isLoading = false;

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
  
  uploadDetailsModal(record: any): void {
    this.selectedRecord = record; // Store the selected record
    console.log("Selected Record:", record);
  
    // Populate uploadedFiles with additionalUploadedFiles if they exist
    this.uploadedFiles = record.additionalUploadedFiles || [];
  
    // Dynamically set dropdown options based on the record's planname (if needed)
    this.documentTypeOptions = this.getOptions(record.planname, record.subcategory);
  
    // Show the modal (if not using Bootstrap, use your own implementation)
    const modalElement = document.getElementById('uploadDetailsModal');
    if (modalElement) {
      modalElement.style.display = 'block'; // Show modal
      modalElement.classList.add('show'); // Add 'show' class
    }
  }
  

  // Dynamic options based on planname
  getOptions(planname: string, subcategory: string): string[] {
    if (planname === 'Mail Management' || planname === 'Virtual Reception' ) {
      return ['Trade License', 'Certificate of Incorporation', 'MAO/AOA', 'Shareholder Documents(passport,ID,utility bills)'];
    } else if (subcategory === 'personal') {
      return ['Passport Copy(Front side)','Passport Copy(Back side)', 'ID Copy(both sides)', 'Utility Bill', 'Salary Slips(past 3 months)', 'Passport Size Photo'];
    } else if (subcategory === 'business') {
      return ['Trade License', 'Certificate of Incorporation', 'MAO/AOA', 'Shareholder Documents(passport,ID,utility bills)'];
    } else {
      return ['General Document', 'Other'];
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
   onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    // For each selected file, get its presigned URL and upload
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.isLoading = true;

      // Request a presigned URL from your backend
      this.userService.getPresignedUrl(file).subscribe(
        (response: any) => {
          const presignedUrl = response.url;

          // Upload the file to the presigned URL
          fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file
          })
            .then(() => {
              // Add the file info to our array, including the user-selected document type
              this.uploadedFiles.push({
                name: file.name,
                url: presignedUrl.split('?')[0], // If you want the actual file URL w/out query
                type: this.selectedDocumentType, 
                // originalType: file.type
              });
              console.log('File uploaded successfully:', file.name);
              this.isLoading = false;
            })
            .catch((error) => {
              console.error('File upload failed', error);
              this.isLoading = false;
            });
        },
        (error) => {
          console.error('Error getting presigned URL', error);
          this.isLoading = false;
        }
      );
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
  
  
  submitDocuments(): void {
    // Example payload
    const payload = {
      someId: this.selectedRecord._id,
      files: this.uploadedFiles
    };

    console.log('Submitting documents:', payload);

    // Make a call to your backend to save file info
    // or do any other processing you need here.
    this.userService.updateAdditionalUploadedFiles(payload)
      .subscribe(
        (response) => {
          console.log('Documents submitted successfully!', response);


          const modalElement = document.getElementById('uploadDetailsModal');
          if (modalElement) {
            modalElement.classList.remove('show'); // Remove Bootstrap's "show" class
            modalElement.style.display = 'none'; // Hide the modal
            modalElement.setAttribute('aria-hidden', 'true'); // Update accessibility
            document.body.classList.remove('modal-open'); // Remove modal-open class from body
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove(); // Remove the backdrop manually if it exists
            }
          }
    
          // Optionally close the modal or reset the form
        },
        (error) => {
          console.error('Error submitting documents', error);
        }
      );
  }

  closeModal(): void {
    this.showModal = false;

    
  }

  closeModalFileupload(): void {
    const modalElement = document.getElementById('uploadDetailsModal');
    if (modalElement) {
      modalElement.style.display = 'none'; // Hide the modal
      modalElement.classList.remove('show'); // Remove the "show" class
    }
  
    // Remove the backdrop if it exists
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  
    // Optionally reset modal-related data here
    this.uploadedFiles = [];
  }
  


  closeModalOutside(event: MouseEvent): void {
    // Closes the modal if the user clicks the backdrop
    this.showModal = false;
  }
  navigateLogout(): void {
    this.router.navigate(['/login']); // Navigate to login
  }
}








