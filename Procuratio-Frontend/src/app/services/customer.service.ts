import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Purchase } from '../models/purchase.model';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private baseUrl = 'http://localhost:3000/api/customers';

  constructor(private http: HttpClient) {}

  getCustomerDetails(customerId: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${customerId}`);
  }

  getCustomerPurchases(customerId: number): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.baseUrl}/${customerId}/purchases`);
  }

  addToPurchase(purchase: Purchase) {
    return this.http.post<Purchase[]>(`${this.baseUrl}/purchases`, purchase);
  }

  addPointsToCustomer(customerId: number, points: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${customerId}/addPoints`, { points });
}
}
