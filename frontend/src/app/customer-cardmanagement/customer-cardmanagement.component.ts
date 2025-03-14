import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { UserService } from '../service/user.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DocumenttypeService } from '../service/documenttype.service';
import { isPlatformBrowser } from '@angular/common';
interface Service {
  name: string;
  description: string;
  status: string;
}
 
declare var jQuery: any;
 
@Component({
  selector: 'app-customer-cardmanagement',
  templateUrl: './customer-cardmanagement.component.html',
  styleUrls: ['./customer-cardmanagement.component.css'], // Fix the styleUrls property
})
export class CustomerCardmanagementComponent implements OnInit, AfterViewInit {
 
  paginatedRecords: any[] = [];  // Data for the current page
  currentPage: number = 1;
  itemsPerPage: number = 10;      // Number of records per page
  totalPages: number = 0;
  filteredRecords: any[] = [];   // Records filtered by search
  searchTerm: string = '';
  isDragging = false;
  services: Service[] = []; // Initialize an empty array for services
  records: any[] = [];
  selectedRecord: any = null; // Initialize to null
  isSidebarActive = false;
  userName: string = ''; // Property to store the user's name
  showModal = false;
  mailManagemnt: any[] = [];
  virtualReceptionist: any[] = [];
bankOpening: any[] = [];
  // Will store the shareholders to display in the modal
  selectedShareholders: any[] = [];
  selectedaddAdditionalFile: any[] = [];
  selectedDocumentType: string = ''; // Stores the selected document type
  uploadedFiles: { name: string; url: string; type: string; recordId: string; size: number; }[] = []; // Stores uploaded files with their document types
 
  documentTypeOptions: string[] = []; // Options for the dropdown
  selectedIndex: number = 0;
 
 
  isLoading = false;
 
 
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private documenttypeService: DocumenttypeService, // Add this
    @Inject(PLATFORM_ID) private platformId: object
 
  ) {
   
  }
 
  ngOnInit(): void {
    // console.log('Current Route:', this.route.snapshot.url); // Check the current URL
 
    // Retrieve the email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      // Call the API with the email
      this.fetchUserServices(email);
      this.userName = this.extractNameFromEmail(email);
    } else {
      console.error('No email found in localStorage.');
    }
 
 
 // Fetch Virtual Receptions
  this.fetchVirtualReceptions();
 
  // Fetch Mail Managements
  this.fetchMailManagements();
  this.fetchBusinessBanks();
  this.fetchPersonalBanks();
  if (isPlatformBrowser(this.platformId)) {
    document.body.classList.add('admin_body');
  }
}
 
 
 
fetchVirtualReceptions(): void {
  this.documenttypeService.getVirtualReceptions().subscribe(
    (data) => {
      console.log('Virtual Receptions:', data);
      this.virtualReceptionist = data.map((item: any) => item.documentType);
      console.log('Virtual Receptions doctypes:', this.virtualReceptionist);
      // Do something with the data
    },
    (error) => {
      console.error('Error fetching virtual receptions:', error);
    }
  );
}
 
fetchMailManagements(): void {
  this.documenttypeService.getMailManagements().subscribe(
    (data) => {
      // console.log('Mail Managements:', data);
      this.mailManagemnt = data.map((item: any) => item.documentType);
      // Do something with the data
    },
    (error) => {
      console.error('Error fetching mail managements:', error);
    }
  );
}
 
 
 
fetchBusinessBanks(): void {
  this.documenttypeService.getBusinessBanks().subscribe(
    (data) => {
      // console.log('Business Banks:', data);
      // this.businessBanks = data; // Store the response
    },
    (error) => {
      console.error('Error fetching business banks:', error);
    }
  );
}
 
fetchPersonalBanks(): void {
  this.documenttypeService.getPersonalBanks().subscribe(
    (data) => {
      // console.log('Personal Banks:', data);
      this.bankOpening = data.map((item: any) => item.documentType); // Store the response
    },
    (error) => {
      console.error('Error fetching personal banks:', error);
    }
  );
}
 
 
  extractNameFromEmail(email: string): string {
    return email.split('@')[0]; // Get the part before the '@' symbol
  }
  ngAfterViewInit() {
 
    // Toggle 'active' class on navbar toggle button
  const navbarToggle = document.querySelector('.navbar-toggle');
  if (navbarToggle) {
    navbarToggle.addEventListener('click', () => {
      navbarToggle.classList.toggle('active');
    });
  }
 
     // Toggle sidebar visibility
 // Ensure 'menu-hide' is NOT present on initial load
 document.body.classList.remove('menu-hide');
 
 // Select the sidebar toggle button
 const sidebarIcon = document.querySelector('.sidebar_icon');
 
 if (sidebarIcon) {
   sidebarIcon.addEventListener('click', () => {
     document.body.classList.toggle('menu-hide');
   });
 }
  }
 
  isActive(route: string): boolean {
    return this.router.url === route;
  }
 
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase(); // Extract file extension
 
    switch (extension) {
        case 'pdf':
            return 'assets/customer_protal/images/pdf-icon.png';
        case 'doc':
        case 'docx':
            return 'assets/customer_protal/images/doc-icon.png';
        case 'jpg':
        case 'jpeg':
            return 'assets/customer_protal/images/jpg-icon.png';
        case 'png':
            return 'assets/customer_protal/images/png-icon.png';
        default:
         
            return 'assets/customer_protal/images/file.jpg'; // Default icon for unknown file types
    }
}
 
fetchUserServices(email: string): void {
  const payload = { email };
  this.userService.fetchUserServices(payload).subscribe(
    (response: any) => {
      if (response && response.data) {
        this.records = response.data;
        this.filteredRecords = this.records;
        this.totalPages = Math.ceil(this.filteredRecords.length / this.itemsPerPage);
        this.setPage(1);
      }
    },
    (error: any) => {
      console.error('Error fetching user services:', error);
    }
  );
}
searchRecords(): void {
  if (this.searchTerm.trim() === '') {
    this.filteredRecords = this.records;
  } else {
    const term = this.searchTerm.toLowerCase();
    this.filteredRecords = this.records.filter(record =>
      (record.planname && record.planname.toLowerCase().includes(term)) ||
      (record.invoiceNumber && record.invoiceNumber.toString().toLowerCase().includes(term))
    );
  }
  this.totalPages = Math.ceil(this.filteredRecords.length / this.itemsPerPage);
  this.setPage(1);
}
 
setPage(page: number): void {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  const startIndex = (page - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.paginatedRecords = this.filteredRecords.slice(startIndex, endIndex);
}
 
// Change items per page and reset to the first page
changeItemsPerPage(value: number): void {
  this.itemsPerPage = value;
  this.totalPages = Math.ceil(this.records.length / this.itemsPerPage);
  this.setPage(1);
}
 
// Getter to calculate the starting entry number for the current page
get startEntry(): number {
  return this.records.length > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
}
 
// Getter to calculate the ending entry number for the current page
get endEntry(): number {
  return Math.min(this.currentPage * this.itemsPerPage, this.records.length);
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
 
    // const modalElement = document.getElementById('detailsModal');
    // if (modalElement) {
    //   // Use the Bootstrap modal
    //   const modal = new (window as any).bootstrap.Modal(modalElement);
    //   modal.show();
    // }
  }
 
  uploadDetailsModal(record: any): void {
    this.selectedRecord = record; // Store the selected record
    // console.log("Selected Record:", record);
 
    // Populate uploadedFiles with additionalUploadedFiles if they exist
    this.additionalFiles = record.additionalUploadedFiles || [];
 
    // Dynamically set dropdown options based on the record's planname (if needed)
    this.documentTypeOptions = this.getOptions(record.planname, record.subcategory);
 
    // Show the modal (if not using Bootstrap, use your own implementation)
    // const modalElement = document.getElementById('uploadDetailsModal');
    // if (modalElement) {
    //   modalElement.style.display = 'block'; // Show modal
    //   modalElement.classList.add('show'); // Add 'show' class
    // }
 
    document.querySelector('.app-wrapper')?.classList.add('blur-background');
  }
 
 
  // Dynamic options based on planname
  getOptions(planname: string, subcategory: string): string[] {
    if ( planname === 'Virtual Receptionist' ) {
      return this.virtualReceptionist.length ? this.virtualReceptionist : ['Loading...'];
    } else if (planname === 'Mail Management') {
      return this.mailManagemnt.length ? this.mailManagemnt : ['Loading...'];
    } else if (planname === 'Bank Account Opening') {
      return this.bankOpening.length ? this.bankOpening : ['Loading...'];
    } else {
      return ['General Document', 'Other'];
    }
  }
 
 
  openFileInNewTab(fileUrl: string): void {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }
 
  openShareholderModal(shareholders: any[],addAdditionalFile:any[]): void {
    this.selectedShareholders = shareholders;
    this.selectedaddAdditionalFile = addAdditionalFile;
    // console.log( this.selectedaddAdditionalFile)
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
                recordId: this.selectedRecord._id,
                size: file.size // Add file size here
                // originalType: file.type
              });
              console.log('File uploaded successfully:', file.name);
             
              this.isLoading = false;
            })
            .catch((error) => {
              console.error('File upload failed', error);
              this.toastr.error(error.message || 'Failed to upload file');
              this.isLoading = false;
            });
        },
        (error) => {
          console.error('Error getting presigned URL', error);
 
          console.error('Error getting presigned URL:', error);
 
          // Angular’s HttpClient typically puts the server’s JSON under error.error
          // e.g., error.error = { error: "File size cannot exceed 1MB" }
          const errorMsg = error.error?.error || 'An error occurred while getting URL';
 
          // Show it in a toast (using ngx-toastr for example)
          this.toastr.error(errorMsg, 'Error');
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
 
    // console.log('Submitting documents:', payload);
    document.querySelector('.app-wrapper')?.classList.remove('blur-background'); //clears the background blur
 
    // Make a call to your backend to save file info
    // or do any other processing you need here.
    this.userService.updateAdditionalUploadedFiles(payload)
      .subscribe(
        (response) => {
          // console.log('Documents submitted successfully!', response);
          const email = localStorage.getItem('userEmail') ?? '';
          this.fetchUserServices(email);
         
          this.uploadedFiles = [];
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
 
    document.querySelector('.app-wrapper')?.classList.remove('blur-background');
  }
 
 
 
  closeModalOutside(event: MouseEvent): void {
    // Closes the modal if the user clicks the backdrop
    this.showModal = false;
  }
  navigateLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('admin_body'); // ✅ Remove the class before navigating
    }
    this.router.navigate(['/login']); // Navigate to login
  }
 
  additionalFiles = [
  ];
 
  newFile: File | null = null;
  newFileCategory = '';
 
  handleFileUpload(event: any) {
    this.newFile = event.target.files[0];
  }
 
  // addAdditionalFile() {
  //   if (this.newFile && this.newFileCategory) {
  //     const newFileEntry = {
  //       category: this.newFileCategory,
  //       name: this.newFile.name,
  //       url: `/path/to/${this.newFile.name}`, // Replace with actual upload logic
  //     };
  //     // this.additionalFiles.push(newFileEntry);
  //     this.newFile = null;
  //     this.newFileCategory = '';
  //   }
  // }
 
  removeAdditionalFile(file: any) {
    this.additionalFiles = this.additionalFiles.filter((f) => f !== file);
  }
 
 
  bytesToSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 Bytes';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
    if (i === 0) {
      return bytes + ' ' + sizes[i];
    }
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  }
  goToPastService(): void {
    this.router.navigate(['/user/pastservice']);
    console.log("clicked")
  }
  goToDashbordService(): void {
    this.router.navigate(['user/dashboard']);
  }
 
  goToHelp(): void {
    this.router.navigate(['/user/helpcenter']);
    console.log("clicked");
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      this.onFilesSelected({ target: { files: event.dataTransfer.files } });
    }
  }
 
}
 
 
 
 
 