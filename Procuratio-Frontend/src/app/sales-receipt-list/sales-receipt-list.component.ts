import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Receipt } from '../models/receipt.model';
import { ReceiptService } from '../services/receipt.service';

@Component({
  selector: 'app-receipt-list',
  templateUrl: './sales-receipt-list.component.html',
  styleUrls: ['./sales-receipt-list.component.scss']
})
export class ReceiptListComponent {
  @Input() receipts: Receipt[] = [];
  @Output() selectReceipt = new EventEmitter<Receipt>();
  
  constructor(private receiptService: ReceiptService) {}

  ngOnInit(): void {
    this.fetchReceipts();
  }

  fetchReceipts(): void {
    this.receiptService.getAllReceipts().subscribe({
      next: (data) => {
        this.receipts = data;
      },
      error: (error) => {
        console.error('Error fetching receipts:', error);
      }
    });
  }

  onSelect(receipt: Receipt): void {
    this.selectReceipt.emit(receipt);
  }
}
