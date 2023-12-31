import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../models/product.model';
import { Receipt, ReceiptItem } from '../models/receipt.model';
import { Service } from '../models/service.model';
import { ReceiptService } from '../services/receipt.service';

@Component({
  selector: 'app-receipt-detail',
  templateUrl: './receipt-detail.component.html',
  styleUrls: ['./receipt-detail.component.scss']
})
export class ReceiptDetailComponent {
  @Input() receipt: Receipt | null = null;
  @Output() updateReceipt = new EventEmitter<Receipt>();
  @Output() addItem = new EventEmitter<{ item: Product | Service; quantity: number }>();
  @Output() removeItem = new EventEmitter<ReceiptItem>();
  @Output() applyPromoCode = new EventEmitter<string>();
  @Output() applyDiscount = new EventEmitter<number>();
  @Output() paymentMethodChange = new EventEmitter<string>();
  @Output() promoCodeApplied = new EventEmitter<string>();
  @Output() deleteReceipt = new EventEmitter<number>();
  emailToSend: string = '';

  constructor(private receiptService: ReceiptService,private router: Router) {}

  handleQuantityChange(event: {item: ReceiptItem, quantity: number}): void {
    const updatedItems = this.receipt?.items.map(i => {
      if(i.product_id === event.item.product_id) {
        return {...i, quantity: event.quantity, total_price: i.price_per_unit * event.quantity};
      }
      return i;
    });

    if(this.receipt && updatedItems) {
      this.receipt.items = updatedItems;
      this.updateReceipt.emit(this.receipt);
    }
  }
  handleDurationChange(event: {item: ReceiptItem, duration: number}): void {
    const updatedItems = this.receipt?.items.map(i => {
      if(i.service_id === event.item.service_id) {
        return {...i, quantity: event.duration};
      }
      return i;
    });

    if(this.receipt && updatedItems) {
      this.receipt.items = updatedItems;
      this.updateReceipt.emit(this.receipt);
    }
  }

  handleDeleteItem(itemToDelete: ReceiptItem): void {
    const updatedItems = this.receipt?.items.filter(i => i.product_id !== itemToDelete.product_id);

    if(this.receipt && updatedItems) {
      this.receipt.items = updatedItems;
      this.updateReceipt.emit(this.receipt);
    }
  }

  calculateTotal(): number {
    if (this.receipt && this.receipt.items) {
      const subtotal = this.receipt.items.reduce((total, item) => total + item.price_per_unit * (item.quantity || 1), 0);
      return subtotal - this.receipt.discount;
    }
    return 0; 
  }
  

  onAddItem(item: Product | Service, quantity: number): void {
    this.addItem.emit({ item, quantity });
  }

  onRemoveItem(item: ReceiptItem): void {
    this.removeItem.emit(item);
  }

  onPaymentMethodChange(newMethod: 'card' | 'check' | 'species'): void {
    this.paymentMethodChange.emit(newMethod);
  }
  
  onApplyPromoCode(promoCode: string): void {
    this.applyPromoCode.emit(promoCode);
  }
  
  onApplyDiscount(discount: number): void {
    this.applyDiscount.emit(discount);
  }
  
  onDeleteReceipt(): void {
    if (this.receipt && this.receipt.id) {
      this.deleteReceipt.emit(this.receipt.id);
    }
  }
  onSendReceipt(): void {
    if (!this.receipt || !this.emailToSend) {
      console.error('Receipt data or email address is missing');
      return;
    }
    if (this.receipt) {
      this.receiptService.sendReceiptByEmail(this.receipt,this.emailToSend).subscribe({
        next: () => alert('Receipt sent successfully!'),
        error: (error) => console.error('Error sending receipt:', error)
      });
    }
    this.router.navigate(['/receipt']);
  }

  
}
