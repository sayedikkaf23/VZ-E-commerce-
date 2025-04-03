import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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

  // Options for the product count dropdown
  productCountOptions = [1, 2, 3, 4, 5];

  constructor(
    private adminAuthService: AdminAuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.editProductForm = this.fb.group({
      productCount: [1, Validators.required], // Default to 1 product
      products: this.fb.array([]) // FormArray for dynamic product fields
    });
  }

  ngOnInit(): void {
    this.getProducts();
    this.setProductFields(1); // Default to 1 product
  }

  get dynamicProducts() {
    return (this.editProductForm.get('products') as FormArray);
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

  // Handle change in the product count dropdown
  onProductCountChange(event: any): void {
    const productCount = event.target.value;
    this.setProductFields(productCount);
  }

  // Dynamically add/remove product fields based on selected count
  setProductFields(count: number): void {
    const currentCount = this.dynamicProducts.length;
    if (count > currentCount) {
      for (let i = currentCount; i < count; i++) {
        this.dynamicProducts.push(this.createProductForm());
      }
    } else if (count < currentCount) {
      for (let i = currentCount - 1; i >= count; i--) {
        this.dynamicProducts.removeAt(i);
      }
    }
  }

  // Create form for each product
// Inside createProductForm method
createProductForm(): FormGroup {
  return this.fb.group({
    name: ['', Validators.required],  // Ensure name is required
    description: ['', Validators.required],  // Ensure description is required
    unitPrice: ['', [Validators.required, Validators.min(0)]],  // Ensure unitPrice is required
    quantity: ['', [Validators.required, Validators.min(1)]],  // Ensure quantity is required
    risk: ['', Validators.required]  // Ensure risk is required
  });
}


  openAddModal(): void {
    this.editProductForm.reset();
    this.selectedProductId = null;
    this.isEditModalOpen = true;
    this.isAddingNew = true;
    this.setProductFields(1); // Default to 1 product
  }

  openEditModal(product: any): void {
    this.editProductForm.patchValue({
      productCount: product.count || 1
    });
    this.setProductFields(product.count || 1);
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
    
    // Log form data for debugging
    console.log('Form Data:', data);
  
    if (this.isAddingNew) {
      // Ensure you're passing the array of products
      const products = data.products;
      this.adminAuthService.addProductRisk({ products }).subscribe(
        (response) => {
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
