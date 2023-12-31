import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-edit-product-dialog',
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.scss']
})
export class EditProductDialogComponent {
  selectedProduct?: Product;
  selectedFile: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product },
    private productService: ProductsService,
    private snackBar: MatSnackBar
  ) {
    this.selectedProduct = Object.assign({}, data.product);
  }
  


  updateProduct() {
    if (this.selectedFile) {
        const formData: FormData = new FormData();
        formData.append('image', this.selectedFile, this.selectedFile.name);

        this.productService.uploadImage(formData).subscribe((response: any) => {
          if (this.selectedProduct) {
            this.selectedProduct.picture = response.imageUrl;
          }
            this.onSave();
        });
    } else {
        this.onSave();
    }
}


  onSave(): void {
    if (this.selectedProduct && this.selectedProduct.product_id) {
      this.productService.updateProduct(this.selectedProduct.product_id, this.selectedProduct).subscribe(updatedProduct => {
      
        this.snackBar.open('Product updated successfully!', 'Close', {
          duration: 2000, 
        });
        this.dialogRef.close(updatedProduct);

      }, (error: any) => {
        console.error('There was an error updating the product:', error);
        this.snackBar.open('Failed to update the product. Please try again.', 'Close', {
          duration: 3000, 
        });
      });
    } else {
      console.error('Product ID is missing. Cannot update.');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: any) {
    this.selectedFile = <File>event.target.files[0];
  }  

}
