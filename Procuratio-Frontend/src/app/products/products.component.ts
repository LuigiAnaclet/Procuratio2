import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../services/products.service';
import { Product } from '../models/product.model';
import { EditProductDialogComponent } from '../edit-product-dialog/edit-product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Service } from '../models/service.model';
import { EditServiceDialogComponent } from '../edit-service-dialog/edit-service-dialog.component';
import { ServicesService } from '../services/services.service';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  productId?: number;
  products: Product[] = [];
  allProducts: Product[] = [];
  selectedProduct?: Product; 
  isEditing = false;

  serviceId?: number;
  services: Service[] = [];
  allServices: Service[] = [];
  selectedService?: Service; 
  activeTab: string = 'Products';

  productSortOptions = [
    {value: 'name', viewValue: 'Sort by Name'},
    {value: 'price', viewValue: 'Sort by Price'},
    {value: 'brand', viewValue: 'Sort by Brand'},
  ];
  
  serviceSortOptions = [
    {value: 'name', viewValue: 'Sort by Service Name'},
    {value: 'price', viewValue: 'Sort by Price'},
    {value: 'duration', viewValue: 'Sort by Duration'},
    {value: 'composition', viewValue: 'Sort by Composition'},
  ];
  
  activeSortOptions = this.productSortOptions;
  
  

  constructor(private shoppingCartService: ShoppingCartService, private productService: ProductsService, public dialog: MatDialog, private serviceService: ServicesService,
    public authService: AuthService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
      this.allProducts = data; 
    });
    this.serviceService.getServices().subscribe((data: Service[]) => {
      this.services = data;
      this.allServices = data; 
    });
  }  

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '500px',
      data: { product: product }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  deleteProduct(product: Product) {
    const productId = product.product_id!;
    if (!productId) {
      console.error('Product ID is missing');
      return;
    }
    if (confirm("Are you sure you want to delete this product?")) {
      this.productService.deleteProduct(productId).subscribe(
        () => {
          this.products = this.products.filter(p => p.product_id !== productId);
          this.allProducts = this.allProducts.filter(p => p.product_id !== productId);
        },
        error => {
          console.error('Error deleting product', error);
          alert('Failed to delete product. Please try again.');
        }
      );
    }
  }

  editService(service: Service): void {
    const dialogRef = this.dialog.open(EditServiceDialogComponent, {
      width: '500px',
      data: { service: service }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  deleteService(service: Service) {
    const serviceId = service.service_id!;
    if (!serviceId) {
      console.error('service ID is missing');
      return;
    }
    if (confirm("Are you sure you want to delete this service?")) {
      this.serviceService.deleteService(serviceId).subscribe(
        () => {
          this.services = this.services.filter(s => s.service_id !== serviceId);
          this.allServices = this.allServices.filter(s => s.service_id !== serviceId);
        },
        error => {
          console.error('Error deleting product', error);
          alert('Failed to delete product. Please try again.');
        }
      );
    }
  }

  onTabChange(event: any): void {
    this.activeTab = event.tab.textLabel;
    if (event.index === 0) {
      this.activeSortOptions = this.productSortOptions;
    } else {
      this.activeSortOptions = this.serviceSortOptions;
    }
  }

onSearch(event: any) {
  let value = event.target.value.toLowerCase();

  if (this.activeTab === 'Products') {
    this.products = this.allProducts.filter(product => product.name.toLowerCase().includes(value)); 
  } else if (this.activeTab === 'Services') {
    this.services = this.allServices.filter(service => service.name.toLowerCase().includes(value));
  }
  
}

onSort(event: any) {
  let value = event;

  if (this.activeTab === 'Products') {
    if(value === 'name') {
      this.products.sort((a, b) => a.name.localeCompare(b.name));
    } else if(value === 'price') {
      this.products.sort((a, b) => a.price - b.price);
    } else if(value === 'brand') { 
      this.products.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
    } 
  } 
  else if (this.activeTab === 'Services') {
    if(value === 'name') {
      this.services.sort((a, b) => a.name.localeCompare(b.name));
    } 
    else if(value === 'price') {
      this.services.sort((a, b) => a.price - b.price);
    }
    else if(value === 'duration') {
      this.services.sort((a, b) => a.duration - b.duration);
    }
    else if(value === 'composition') {
      this.services.sort((a, b) => a.composition.localeCompare(b.composition));
    } 

  }
}

  addToCart(product: Product) {
    this.shoppingCartService.addToCart(product);
  }
}
