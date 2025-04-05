import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminAuthService } from '../service/admin-auth.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { GetnationalityService } from '../service/getnationality.service';

@Component({
  selector: 'app-risk',
  templateUrl: './risk.component.html',
  styleUrl: './risk.component.css'
})
export class RiskComponent {
  riskList = [
    { risk: 'High', isActive: true },
    { risk: 'Medium', isActive: true },
    { risk: 'Low', isActive: true },
   
  ];
  editRiskForm: FormGroup;
  isEditModalOpen = false;
 
  isAddingNew = false;
  nationalities: any[] = [];

  constructor(
    private adminAuthService: AdminAuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
        private cdRef: ChangeDetectorRef,
    
    private getnationalityService: GetnationalityService,
  ) {
    this.editRiskForm = this.fb.group({
     
      risk: ['']
    });
  }

  ngOnInit(): void {
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

  getRiskList(): void {
   
  }

  openAddModal(): void {
    this.isEditModalOpen = true;
    this.isAddingNew = true;
   
    this.editRiskForm.reset();
  }

  openEditModal(risk: any): void {
    this.isEditModalOpen = true;
    this.isAddingNew = false;
  
    this.editRiskForm.patchValue({

      risk: risk
    });
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    
  }

  saveRisk(): void {
   
  }

  deleteRisk(id: string): void {
    
  }

}
