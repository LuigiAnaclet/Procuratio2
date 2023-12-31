import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Receipt } from '../models/receipt.model';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private baseUrl = 'http://localhost:3000/api/sales-receipts';

  constructor(private http: HttpClient) {}

  // Retrieve a receipt by its ID
  getReceiptById(id: number): Observable<Receipt> {
    return this.http.get<Receipt>(`${this.baseUrl}/${id}`);
  }

  // Retrieve all receipts
  getAllReceipts(): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(this.baseUrl);
  }

  // Update a receipt
  updateReceipt(id: number, receipt: Receipt): Observable<Receipt> {
    return this.http.put<Receipt>(`${this.baseUrl}/${id}`, receipt);
  }

  // Delete a receipt
  deleteReceipt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  saveReceipt(receipt: Receipt): Observable<Receipt> {
    
    if (receipt.receipt_id) {
      return this.http.put<Receipt>(`${this.baseUrl}/${receipt.receipt_id}`, receipt);
    } else {
      return this.http.post<Receipt>(this.baseUrl, receipt);
    }
  }
  validatePromoCode(promoCode: string): Observable<number> {
    return this.http.get<any>(`http://localhost:3000/api/promo-codes/${promoCode}`);
  }

  sendReceiptByEmail(receipt: Receipt, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/send-receipt`, {receipt, email});
  }
  }
