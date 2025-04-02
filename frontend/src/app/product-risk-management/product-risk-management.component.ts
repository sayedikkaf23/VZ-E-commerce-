import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminAuthService } from '../service/admin-auth.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-risk-management',
  templateUrl: './product-risk-management.component.html',
  styleUrls: ['./product-risk-management.component.css']
})
export class ProductRiskManagementComponent implements OnInit {
  products: any[] = [];
  editProductForm: FormGroup;
  isEditModalOpen = false;
  selectedProductId: string | null = null;
  isAddingNew = false;

  

  constructor(
    private adminAuthService: AdminAuthService,
    private fb: FormBuilder,
    
    private toastr: ToastrService
  ) {
    this.editProductForm = this.fb.group({
      name: [''],
      description: [''],
      unitPrice: [''],
      quantity: [''],
      risk: ['']
    });
  }

  ngOnInit(): void {
    this.getProducts();
    
  }

  getProducts(): void {
    this.adminAuthService.getProductRisks().subscribe(
      (res) => this.products = res,
      (err) => {
        console.error('Error fetching products:', err);
        this.toastr.error('Failed to fetch products.');
      }
    );
  }

  filteredProducts: any[] = [];

getFilteredProducts(selectedCountry: string, selectedProductIds: string[], isAutoApproved: boolean): void {
  const requestData = {
    country: selectedCountry,
    selectedProductIds,
    isAutoApproved
  };

  this.adminAuthService.getFilteredProductsByCountry(requestData).subscribe(
    (res) => {
      this.filteredProducts = res.products;
    },
    (err) => {
      console.error('Error filtering products:', err);
    }
  );
}

onCountryChange(country: string): void {
  const productIds = this.products.map(p => p._id); // or your current product list
  const isAutoApproved = true; // or fetch based on customer settings

  this.getFilteredProducts(country, productIds, isAutoApproved);
}

  openAddModal(): void {
    this.editProductForm.reset();
    this.selectedProductId = null;
    this.isEditModalOpen = true;
    this.isAddingNew = true;
  }

  openEditModal(product: any): void {
    this.editProductForm.patchValue(product);
    this.selectedProductId = product._id;
    this.isEditModalOpen = true;
    this.isAddingNew = false;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedProductId = null;
  }

  saveProduct(): void {
    const data = this.editProductForm.value;
    if (this.isAddingNew) {
      this.adminAuthService.addProductRisk(data).subscribe(
        () => {
          this.getProducts();
          this.closeEditModal();
          this.toastr.success('Product added successfully!');
        },
        (error) => {
          console.error('Add error:', error);
          this.toastr.error('Failed to add product.');
        }
      );
    } else if (this.selectedProductId) {
      this.adminAuthService.updateProductRisk(this.selectedProductId, data).subscribe(
        () => {
          this.getProducts();
          this.closeEditModal();
          this.toastr.success('Product updated successfully!');
        },
        (error) => {
          console.error('Update error:', error);
          this.toastr.error('Failed to update product.');
        }
      );
    }
  }

  deleteProduct(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminAuthService.deleteProductRisk(id).subscribe(
          () => {
            this.getProducts();
            this.toastr.success('Product deleted successfully!');
          },
          (error) => {
            console.error('Delete error:', error);
            this.toastr.error('Failed to delete product.');
          }
        );
      }
    });
  }
}
