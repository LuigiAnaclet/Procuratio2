import { Component, OnInit } from '@angular/core';
import { ReceiptService } from '../services/receipt.service';
import { Receipt, ReceiptItem } from '../models/receipt.model';
import { Product } from '../models/product.model';
import { Service } from '../models/service.model';

@Component({
  selector: 'app-sales-receipt',
  templateUrl: './sales-receipt.component.html',
  styleUrls: ['./sales-receipt.component.scss']
})
export class SalesReceiptComponent implements OnInit {
  currentReceipt: Receipt | null = null;
  receipts: Receipt[] = [];
  selectedReceipt: Receipt | null = null;
  editingReceipt: boolean = false;
  isAddingProduct: boolean = false;
  isAddingService: boolean = false;

  constructor(private receiptService: ReceiptService) {}

  ngOnInit(): void {
    this.loadReceipts();
  }

  loadReceipts(): void {
    this.receiptService.getAllReceipts().subscribe({
      next: (data) => {
        this.receipts = data;
      },
      error: (error) => {
        console.error('Error fetching receipts:', error); 
      }
    });
  }

  onCreateNewReceipt(): void {
    this.currentReceipt = {
      customer_name: '',
      seller_id:1, 
      items: [],
      discount: 0,
      paymentMethod: 'card', 
      total: 0, 
    };
    this.editingReceipt = true;
    this.isAddingProduct = true;
    this.isAddingService = true;
    this.onSaveReceipt(this.currentReceipt);
  }

  onDeleteReceipt(receiptId: number): void { 
    this.receiptService.deleteReceipt(receiptId).subscribe({
      next: () => {
        this.selectedReceipt = null;
        this.loadReceipts();
      },
      error: (error) => {
        console.error('Error deleting receipt:', error);
      }
    });
  }


  addProductToReceipt(product: Product, quantity: number): void {
    if (this.currentReceipt && product.product_id) {
      const validQuantity = Number(quantity) || 1;
  
      const existingItemIndex = this.currentReceipt.items.findIndex(item => item.product_id === product.product_id);
  
      if (existingItemIndex === -1) {
        const receiptItem: ReceiptItem = {
          product_id: product.product_id,
          name: product.name,
          price_per_unit: parseFloat(product.price.toFixed(2)),
          quantity: validQuantity,
          type: 'product',
          total_price: parseFloat((product.price * validQuantity).toFixed(2))
        };
        this.currentReceipt.items.push(receiptItem);
      } else {
        const existingItem = this.currentReceipt.items[existingItemIndex];
        existingItem.quantity += validQuantity;
        existingItem.total_price = parseFloat((existingItem.quantity * product.price).toFixed(2));
      }
  
      this.calculateTotal();
  
      if (this.currentReceipt.total > 0) {
        this.onSaveReceipt(this.currentReceipt);
      }
    } else {
      console.error('Current receipt or product ID is undefined');
    }
  }
  
  addServiceToReceipt(service: Service): void {
    if (this.currentReceipt && service.service_id !== undefined) {
      const receiptItem: ReceiptItem = {
        service_id: service.service_id,
        name: service.name,
        price_per_unit: service.price,
        total_price: service.price,
        duration: service.duration,
        quantity:1,
        type: 'service'
      };
      
      this.currentReceipt.items.push(receiptItem);
      this.calculateTotal();
    if (this.currentReceipt.total > 0) {
      this.onSaveReceipt(this.currentReceipt);
    }}
  }

  onItemAdded(event: { item: Product | Service, quantity: number }): void {
    if (event.item.hasOwnProperty('product_id')) {
      this.addProductToReceipt(event.item as Product,event.quantity);
    } else if (event.item.hasOwnProperty('service_id')) {
      this.addServiceToReceipt(event.item as Service);
    }
  }

  onSaveReceipt(receipt: Receipt): void {
    if (receipt.id) {
      this.receiptService.updateReceipt(receipt.id, receipt).subscribe({
        next: (updatedReceipt) => {
          console.log('Receipt updated:', updatedReceipt);
          this.loadReceipts();
          this.editingReceipt = false;
          
        },
        error: (error) => {
          console.error('Error updating receipt:', error);
        }
      });
    } else {
      this.receiptService.saveReceipt(receipt).subscribe({
        next: (newReceipt) => {
          this.loadReceipts();
          this.editingReceipt = false;
          this.currentReceipt = newReceipt;
        },
        error: (error) => {
          console.error('Error creating receipt:', error);
        }
      });
    }
  }

  handleApplyPromoCode(promoCode: string): void {
    this.receiptService.validatePromoCode(promoCode).subscribe({
      next: (response) => {
        if (this.currentReceipt) {
          console.log(this.currentReceipt.discount);
          this.calculateTotal();
          this.onSaveReceipt(this.currentReceipt);
        }
      },
      error: (error) => {
        console.error('Invalid promo code:', error);
      },
    });
  }
  handleApplyDiscount(discount: number): void {
    if (this.currentReceipt) {
      this.currentReceipt.discount += discount;
      this.calculateTotal();
      this.onSaveReceipt(this.currentReceipt);
    }
  }

  calculateTotal(): void {
    if (this.currentReceipt) {
      let subtotal = this.currentReceipt.items.reduce((acc, item) => acc + item.price_per_unit * (item.quantity || 1), 0);
      
      if (this.currentReceipt.promoCode) {
        subtotal = subtotal* (this.currentReceipt.discount/100);
      }
      
      subtotal = subtotal* (this.currentReceipt.discount/100);
      
      this.currentReceipt.total = subtotal;
    }
  }

  applyDiscount(discountValue: number): void {
    if (this.currentReceipt) {
      this.currentReceipt.discount = discountValue;
      this.calculateTotal();
    }
  }

  onReceiptNameChanged(name: string): void {
    if (this.currentReceipt) {
      this.currentReceipt.customer_name = name;
      this.onSaveReceipt(this.currentReceipt);
    }
  }

  onReceiptSelected(receipt: Receipt): void {
    if (receipt && receipt.receipt_id !== undefined) {
      this.receiptService.getReceiptById(receipt.receipt_id).subscribe({
        next: (detailedReceipt) => {
          console.log("Fetched detailed receipt:", detailedReceipt);
          this.selectedReceipt = detailedReceipt;
          this.currentReceipt = detailedReceipt;
          this.editingReceipt = true;
          this.isAddingProduct = true;
          this.isAddingService = true; 
        },
        error: (error) => {
          console.error('Error fetching receipt details:', error);
        }
      });
    } else {
      console.error('Selected receipt has no ID:', receipt);
    }
  }
  
}
