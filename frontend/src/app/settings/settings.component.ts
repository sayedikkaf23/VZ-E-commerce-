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
  isEditModalOpen = false;
  selectedServiceId: string | null = null;
  selectedFile: File | null = null;

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

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedServiceId = null;
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  updateService(): void {
    const serviceData = this.editServiceForm.value;
    if (this.selectedServiceId) {
      this.adminAuthService.updateService(this.selectedServiceId, serviceData, this.selectedFile).subscribe(
        (response) => {
          console.log('Service updated successfully:', response);
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
            console.log('Service deleted successfully:', response);
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
