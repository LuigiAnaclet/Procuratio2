import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReceiptItem } from '../models/receipt.model';

@Component({
  selector: 'app-receipt-item',
  templateUrl: './receipt-item.component.html',
  styleUrls: ['./receipt-item.component.scss']
})
export class ReceiptItemComponent {
  @Input() item: ReceiptItem | null = null;
  @Output() quantityChange = new EventEmitter<{item: ReceiptItem, quantity: number}>();
  @Output() durationChange = new EventEmitter<{item: ReceiptItem, duration: number}>();
  @Output() deleteItem = new EventEmitter<ReceiptItem>();

  onQuantityDurationChange(newValue: string) {
    const value = parseInt(newValue, 10);
    if (this.item && !isNaN(value)) {
      if (this.item.type === 'product') {
        this.quantityChange.emit({ item: this.item, quantity: value });
      } else if (this.item.type === 'service') {
        this.durationChange.emit({ item: this.item, duration: value });
      }
    }
  }
  onDeleteItem() {
    if (this.item) {
      this.deleteItem.emit(this.item);
    }
  }
}
