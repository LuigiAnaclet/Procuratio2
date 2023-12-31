import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Product } from '../models/product.model';
import { Service } from '../models/service.model';
import { ProductsService } from '../services/products.service';
import { ServicesService } from '../services/services.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  @Output() itemAdded = new EventEmitter<{ item: Product | Service, quantity: number }>();
  @Output() receiptNameChanged = new EventEmitter<string>();
  
  products: Product[] = [];
  services: Service[] = [];
  receiptName: string = '';
  selectedProductId: number | null = null;
  selectedServiceId: number | null = null;
  quantity: number = 1;

  constructor(private productService: ProductsService, private serviceService: ServicesService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products: Product[]) => {
      this.products = products;
    });

    this.serviceService.getServices().subscribe((services: Service[]) => {
      this.services = services;
    });
  }

  onProductSelected(event: any): void {
    this.selectedServiceId = null;  
    this.selectedProductId = event.value;
  }

  onServiceSelected(event: any): void {
    this.selectedProductId = null; 
    this.selectedServiceId = event.value;
  }

  onAddItem() {
    let selectedItem: Product | Service | undefined;
  
    if (this.selectedProductId !== null) {
      selectedItem = this.products.find(product => product.product_id === this.selectedProductId);
    } else if (this.selectedServiceId !== null) {
      selectedItem = this.services.find(service => service.service_id === this.selectedServiceId);
    }
  
    if (selectedItem) {
      this.itemAdded.emit({ item: selectedItem, quantity: this.quantity });
      this.selectedProductId = null;
      this.selectedServiceId = null;
    }
  }
  

  onReceiptNameChange(): void {
    this.receiptNameChanged.emit(this.receiptName);
  }

  editReceiptName(): void {
    this.onReceiptNameChange();
}

}
