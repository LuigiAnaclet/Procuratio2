import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private baseUrl: string = 'http://localhost:3000/api/products';

  constructor(private httpClient: HttpClient) { }

  getProducts() {
    return this.httpClient.get<Product[]>(this.baseUrl);
  }

  getProductById(id: number) {
    return this.httpClient.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(product: Product) {
    return this.httpClient.post<Product>(this.baseUrl, product);
  }

  updateProduct(id: number, product: Product) {
    return this.httpClient.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: number) {
    return this.httpClient.delete<Product>(`${this.baseUrl}/${id}`);
  }

  uploadImage(imageData: FormData): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}`+'/uploadS', imageData);
  }

  reduceProductQuantity(productId: number, quantity: number): Observable<any> {
    const url = `${this.baseUrl}/reduceQuantity/${productId}`;
    return this.httpClient.patch(url, { quantity });
  }  
}
