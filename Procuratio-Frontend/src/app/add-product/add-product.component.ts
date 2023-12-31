import { Component } from '@angular/core';
import { ProductsService } from '../services/products.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent {

  selectedFile: File | null = null;
  
  product: Product = {
    name: '',
    quantity: 0,
    price: 0,
    type:"product",
  };

  constructor(private productService: ProductsService) { }

  ngOnInit(): void {
  }

  addProduct() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile, this.selectedFile.name);
      
      this.productService.uploadImage(formData).subscribe({
        next: (response) => {
          this.product.picture = response.imageUrl; 
  
          this.productService.createProduct(this.product).subscribe({
            next: (data) => {
              console.log('Product added with image successfully!', data);
            },
            error: (addError) => {
              console.error('Failed to add product after image upload:', addError);
            }
          });
        },
        error: (uploadError) => {
          console.error('Failed to upload image:', uploadError);
        }
      });
    } else {
      this.productService.createProduct(this.product).subscribe({
        next: (data) => {
          console.log('Product added!', data);
        },
        error: (addError) => {
          console.error('Failed to add product:', addError);
        }
      });
    }
  }
  
  

sendProductToServer() {
  this.productService.createProduct(this.product).subscribe(
      data => {
          console.log('Product added!', data);
      },
      error => {
          if (error.error.message === 'Supplier does not exist') {
              console.error('Supplier does not exist');
          } else {
              console.error('Failed to add product', error);
          }
      }
  );
}

onFileSelected(event: any) {
  this.selectedFile = <File>event.target.files[0];
}  
}
