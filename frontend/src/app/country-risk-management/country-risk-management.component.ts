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
  riskList: any[] = [];
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
      RiskRating: ['']
    });
  }

  ngOnInit(): void {
    this.getCountryRisks();
    this.getRiskList();
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
      (res: any[]) => {
        this.countryRisks = res.sort((a, b) => a.country.localeCompare(b.country));
      },
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

  getRiskList(): void {
    this.adminAuthService.getRisk().subscribe(
      (res) => this.riskList = res,
      (err) => {
        console.error('Error fetching risk list:', err);
        this.toastr.error('Failed to fetch risk list.');
      }
    );
  }

  openEditModal(country: any): void {
    this.isEditModalOpen = true;
    this.isAddingNew = false;
    this.selectedCountryId = country._id;
    const riskMap: { [key: string]: number } = { Low: 1, Medium: 2, High: 3 };

    this.editCountryForm.patchValue({
      country: country.country,
      RiskRating: riskMap[country.risk] || 0
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
          if (error.status === 409 || error.error?.message?.includes('already exists')) {
            this.toastr.warning('Country already exists!');
          } else {
            this.toastr.error('Error adding country risk.');
          }
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