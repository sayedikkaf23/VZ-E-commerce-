// country-risk-management.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminAuthService } from '../service/admin-auth.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { GetnationalityService } from '../service/getnationality.service';

@Component({
  selector: 'app-country-risk-management',
  templateUrl: './country-risk-management.component.html',
  styleUrls: ['./country-risk-management.component.css']
})
export class CountryRiskManagementComponent implements OnInit {
  countryRisks: any[] = [];
  editCountryForm: FormGroup;
  isEditModalOpen = false;
  selectedCountryId: string | null = null;
  isAddingNew = false;
  nationalities: any[] = [];

  constructor(
    private adminAuthService: AdminAuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
        private cdRef: ChangeDetectorRef,
    
    private getnationalityService: GetnationalityService,
  ) {
    this.editCountryForm = this.fb.group({
      country: [''],
      risk: ['']
    });
  }

  ngOnInit(): void {
    this.getCountryRisks();
    this.getnationalityService.getNationality().subscribe((data) => {
      this.nationalities = data.map((country: any) => ({
        common: country.name.common,
        country: country.name.country
      }));

      // Trigger change detection to update the view
      this.cdRef.detectChanges();
    });
  }

  getCountryRisks(): void {
    this.adminAuthService.getCountryRisks().subscribe(
      (res) => this.countryRisks = res,
      (err) => {
        console.error('Error fetching countries:', err);
        this.toastr.error('Failed to fetch countries.');
      }
    );
  }

  openAddModal(): void {
    this.isEditModalOpen = true;
    this.isAddingNew = true;
    this.selectedCountryId = null;
    this.editCountryForm.reset();
  }

  openEditModal(country: any): void {
    this.isEditModalOpen = true;
    this.isAddingNew = false;
    this.selectedCountryId = country._id;
    this.editCountryForm.patchValue({
      country: country.country,
      risk: country.risk
    });
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedCountryId = null;
  }

  saveCountry(): void {
    const data = this.editCountryForm.value;
    if (this.isAddingNew) {
      this.adminAuthService.addCountryRisk(data).subscribe(
        () => {
          this.getCountryRisks();
          this.closeEditModal();
          this.toastr.success('Country risk added successfully!');
        },
        (error) => {
          console.error('Add failed:', error);
          this.toastr.error('Error adding country risk.');
        }
      );
    } else if (this.selectedCountryId) {
      this.adminAuthService.updateCountryRisk(this.selectedCountryId, data).subscribe(
        () => {
          this.getCountryRisks();
          this.closeEditModal();
          this.toastr.success('Country risk updated successfully!');
        },
        (error) => {
          console.error('Update failed:', error);
          this.toastr.error('Error updating country risk.');
        }
      );
    }
  }

  deleteCountry(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminAuthService.deleteCountryRisk(id).subscribe(
          () => {
            this.getCountryRisks();
            this.toastr.success('Country risk deleted successfully!');
          },
          (error) => {
            console.error('Delete failed:', error);
            this.toastr.error('Error deleting country risk.');
          }
        );
      }
    });
  }
}