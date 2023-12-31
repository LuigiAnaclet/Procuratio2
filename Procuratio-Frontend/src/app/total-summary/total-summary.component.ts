import { Component, Input } from '@angular/core';
import { Receipt, ReceiptItem } from '../models/receipt.model';

@Component({
  selector: 'app-total-summary',
  templateUrl: './total-summary.component.html',
  styleUrls: ['./total-summary.component.scss']
})
export class TotalSummaryComponent {
  @Input() receipt?: Receipt;

  get subtotal(): number {
    if (!this.receipt || !this.receipt.items) {
      return 0;
    }
    return this.receipt.items.reduce((sum, item) => sum + item.price_per_unit * item.quantity, 0);
  }

  get discountAmount(): number {
    if (!this.receipt) {
      return 0;
    }
    return (this.subtotal * this.receipt.discount) / 100;
  }

  get total(): number {
    return this.subtotal - this.discountAmount;
  }
}
