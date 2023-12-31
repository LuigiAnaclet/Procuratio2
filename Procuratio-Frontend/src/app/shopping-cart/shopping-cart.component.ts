import { Component, OnInit } from '@angular/core';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { Product } from '../models/product.model';
import { AuthService } from '../services/auth.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { CartItem } from '../models/cartItem.model';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  cartItemsArray: Array<{ product: Product; quantity: number; }> = [];
  cartItems: any[] = [];
  userId: number | null;

  constructor(private shoppingCartService: ShoppingCartService, private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    this.userId = user && user.user_id != null ? user.user_id : null;  }

ngOnInit() {
  if (this.userId) {
    this.shoppingCartService.getCartForUser(this.userId).subscribe((cartItems: CartItem[]) => {
      const productDetailsRequests = cartItems.map(item =>
        this.shoppingCartService.getProductDetails(item.product_id).pipe(
          map(product => ({
            ...item,
            product: product || {} as Product
          })),
          catchError(error => {
            console.error('Error fetching product details', error);
            return of({ 
              ...item, 
              product: {
                name: 'Unknown Product',
              } as Product
            });
          })
        )
      );
      forkJoin(productDetailsRequests).subscribe(fullCartItems => {
        this.cartItemsArray = fullCartItems as { product: Product; quantity: number; }[];
      });
    });
  }
}
  

removeItemFromCart(productId: number): void {
  if (this.userId) {
    this.shoppingCartService.deleteOneItem(this.userId, productId).subscribe(
      () => {
        console.log('Item deleted successfully');
        const index = this.cartItemsArray.findIndex(item => item.product.product_id === productId);
        if (index !== -1) {
          if (this.cartItemsArray[index].quantity > 1) {
            this.cartItemsArray[index].quantity -= 1;
          } else {
            this.cartItemsArray.splice(index, 1);
          }
        }
      },
      error => console.error('Error deleting item:', error)
    );
  }
}


  clearCart() {
    if (this.userId) {
      this.shoppingCartService.clearCartForUser(this.userId).subscribe(() => {
        this.cartItemsArray = [];
      });
    }
  }
}
