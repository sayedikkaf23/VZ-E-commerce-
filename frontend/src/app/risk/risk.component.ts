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
  riskList: any[] = [];
  addRiskForm!: FormGroup;
  isAddModalOpen = false;
 
  isAddingNew = false;
  nationalities: any[] = [];

  constructor(
    private adminAuthService: AdminAuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    
  ) {
    
  }

  ngOnInit(): void {
    this.getRiskList();
    this.addRiskForm = this.fb.group({
      name: [''],
      isActive: [true]
    });
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

  openAddModal(): void {
    this.isAddModalOpen = true;

  }


  addRisk(): void {
    if (this.addRiskForm.valid) {
      const { name, isActive } = this.addRiskForm.value;
      this.adminAuthService.addRisk(name, isActive)
        .subscribe({
          next: (res) => {
            console.log('New Risk created:', res);
            
            this.getRiskList(); // Refresh the service list after updating
            this.closeAddModal();
            this.toastr.success('New Risk added successfully!'); // Show success message
          },
          error: (err) => {
            console.error('Error: adding new risk', err);
            this.toastr.error('Error adding new risk.'); // Show error message
          }
        });
    }
  }
 

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.addRiskForm.reset({
      serviceName: '',
      description: '',
      isActive: false
    });
  }



  deleteRisk(id: string): void {
    
  }

}
