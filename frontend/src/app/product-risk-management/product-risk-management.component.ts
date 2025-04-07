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
  riskList: any[] = [];

  // Options for the product count dropdown
  productCountOptions = [1, 2, 3, 4, 5];

  constructor(
    private adminAuthService: AdminAuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    // Initialize the form with a default product count and an empty FormArray for products
    this.editProductForm = this.fb.group({
      productCount: [1, Validators.required],
      products: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.getProducts();
    this.getRiskList();
    this.setProductFields(1); // Default to one product field
  }

  // Shortcut to access the dynamic FormArray
  get dynamicProducts() {
    return this.editProductForm.get('products') as FormArray;
  }

  // Fetch products from the API
  getProducts(): void {
    this.adminAuthService.getProductRisks().subscribe(
      (res) => this.products = res,
      (err) => {
        console.error('Error fetching products:', err);
        this.toastr.error('Failed to fetch products.');
      }
    );
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

  // Adjust the number of dynamic product fields when the product count changes
  onProductCountChange(event: any): void {
    const productCount = event.target.value;
    this.setProductFields(productCount);
  }

  // Dynamically add or remove product fields based on the selected count
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

  // Create a FormGroup for each product with necessary validations
  createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      unitPrice: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      risk: ['', Validators.required]
    });
  }

  // Open the modal for adding a new product
  openAddModal(): void {
    this.editProductForm.reset();
    this.selectedProductId = null;
    this.isEditModalOpen = true;
    this.isAddingNew = true;
    this.setProductFields(1); // Always start with one product field for adding
  }

  // Open the modal for editing an existing product
  openEditModal(product: any): void {
    // Set the form to a single product update
    this.editProductForm.patchValue({ productCount: 1 });
    this.setProductFields(1);
    this.selectedProductId = product._id;
    this.isEditModalOpen = true;
    this.isAddingNew = false;

    // Pre-populate the first dynamic form with the product's current details
    this.dynamicProducts.at(0).patchValue({
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice,
      quantity: product.quantity,
      risk: product.risk
    });
  }

  // Close the modal and reset selection
  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedProductId = null;
  }

  // Save a new product or update an existing one based on the modal mode
  saveProduct(): void {
    const data = this.editProductForm.value;
    console.log('Form Data:', data);

    if (this.isAddingNew) {
      // For adding, send an object with a products array
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
      // For updating, call the service with two arguments: the id and the product update data.
      // The service method will handle wrapping it in an array.
      const productUpdate = data.products[0];
      this.adminAuthService.updateProductRisk(this.selectedProductId, productUpdate).subscribe(
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

  // Delete a product after confirmation
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
