import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  private itemsInCartSubject = new BehaviorSubject<Map<number, { product: Product; quantity: number; }>>(new Map());
  
  private baseUrl: string = 'http://localhost:3000/api/cart';

  constructor(private httpClient: HttpClient, private authService: AuthService) {}


  public addToCart(product: Product, quantity: number = 1) {
    const userId = this.authService.getCurrentUser()?.user_id;
    if (userId && product.product_id != null) {
      this.saveCartForUser(userId, [{ product_id: product.product_id, quantity }]).subscribe(
        () => {
          console.log('Product added to cart');
        },
        error => console.error('Error adding product to cart:', error)
      );
    }
  }

    public getCartForUser(userId: number): Observable<any> {
      return this.httpClient.get(`${this.baseUrl}/${userId}`);
    }
    
    public saveCartForUser(userId: number, cartItems: any[]): Observable<any> {
      return this.httpClient.post(`${this.baseUrl}`, { userId, items: cartItems });
    }    
  
    public clearCartForUser(userId: number): Observable<any> {
      return this.httpClient.delete(`${this.baseUrl}/${userId}`);
    }

    public deleteOneItem(userId: number, productId: number): Observable<any> {
      return this.httpClient.delete(`${this.baseUrl}/${userId}/${productId}`);
    }
    

    getProductDetails(productId: number): Observable<Product> {
      return this.httpClient.get<Product>(`http://localhost:3000/api/products/${productId}`);
    }

    
}


