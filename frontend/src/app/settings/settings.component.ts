import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminAuthService } from '../service/admin-auth.service';

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
    private fb: FormBuilder
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
        },
        (error) => {
          console.error('Error updating service:', error);
        }
      );
    }
  }
}
