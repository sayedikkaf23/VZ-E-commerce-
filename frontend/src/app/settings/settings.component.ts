import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminAuthService } from '../service/admin-auth.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService
import Swal from 'sweetalert2'; // Import SweetAlert2

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  services: any[] = [];
  editServiceForm: FormGroup;
  addServiceForm!: FormGroup;
  isEditModalOpen = false;
  selectedServiceId: string | null = null;
  selectedFile: File | null = null;
  showModal = false;

  constructor(
    private adminAuthService: AdminAuthService,
    private fb: FormBuilder,
    private toastr: ToastrService // Inject ToastrService
  ) {
    this.editServiceForm = this.fb.group({
      serviceName: [''],
      description: [''],
      isActive: [false],
    });
  }

  ngOnInit(): void {
    this.getServices();
    this.addServiceForm = this.fb.group({
      serviceName: [''],
      description: [''],
      isActive: [true]
    });
  }

  getServices(): void {
    this.adminAuthService.getServices().subscribe(
      (response) => {
        this.services = response;
      },
      (error) => {
        console.error('Error fetching services:', error);
        this.toastr.error('Failed to fetch services.'); // Show error message
      }
    );
  }

  openEditModal(service: any): void {
    this.isEditModalOpen = true;
    this.selectedServiceId = service._id;
    this.editServiceForm.patchValue({
      serviceName: service.serviceName,
      description: service.description,
      isActive: service.isActive
    });
  }

  openAddModal(): void {
    this.showModal = true;
  }

  addService(): void {
    if (this.addServiceForm.valid) {
      const { serviceName, description, isActive } = this.addServiceForm.value;
      this.adminAuthService.addService(serviceName, description, isActive)
        .subscribe({
          next: (res) => {
            console.log('Service created:', res);
            
            this.getServices(); // Refresh the service list after updating
            this.closeAddModal();
            this.toastr.success('New Service added successfully!'); // Show success message
          },
          error: (err) => {
            console.error('Error: adding new service', err);
            this.toastr.error('Error adding new service.'); // Show error message
          }
        });
    }
  }

  closeAddModal(): void {
   this.showModal=false
     // Reset the form with default values (if any)
  this.addServiceForm.reset({
    serviceName: '',
    description: '',
    isActive: false
  });
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedServiceId = null;
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
  onStatusChange(service: any, event: Event): void {
    const newStatus = (event.target as HTMLInputElement)?.checked;

    // Update local value immediately
    service.isActive = newStatus;

    const updateData = {
      serviceName: service.serviceName,
      description: service.description,
      isActive: newStatus
    };

    this.adminAuthService.updateService(service._id, updateData, null)
      .subscribe({
        next: () => {
          this.toastr.success('Service status updated successfully!');
        },
        error: (error) => {
          console.error('Error updating service status:', error);
          this.toastr.error('Failed to update service status.');
          // Revert local change on failure
          service.isActive = !newStatus;
        }
      });
  }


  updateService(): void {
    const serviceData = this.editServiceForm.value;
    if (this.selectedServiceId) {
      this.adminAuthService.updateService(this.selectedServiceId, serviceData, this.selectedFile).subscribe(
        (response) => {
          // console.log('Service updated successfully:', response);
          this.getServices(); // Refresh the service list after updating
          this.closeEditModal(); // Close the modal after updating
          this.toastr.success('Service updated successfully!'); // Show success message
        },
        (error) => {
          console.error('Error updating service:', error);
          this.toastr.error('Error updating service.'); // Show error message
        }
      );
    }
  }

  deleteService(serviceId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminAuthService.deleteService(serviceId).subscribe(
          (response) => {
            // console.log('Service deleted successfully:', response);
            this.getServices(); // Refresh the service list after deletion
            this.toastr.success('Service deleted successfully!'); // Show success message
          },
          (error) => {
            console.error('Error deleting service:', error);
            this.toastr.error('Error deleting service.'); // Show error message
          }
        );
      }
    });
  }
}
