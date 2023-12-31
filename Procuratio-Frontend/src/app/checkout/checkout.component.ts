import { Component, OnInit } from '@angular/core';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { Product } from '../models/product.model';
import { PaymentService } from '../services/payment.service';
import { ProductsService } from '../services/products.service';
import { CartItem } from '../models/cartItem.model';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';
import { Purchase } from '../models/purchase.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  totalAmount: number = 0;
  cartItemsArray: Array<{ product: Product; quantity: number; }> = [];
  cartItems: any[] = [];
  userId: number | null;

  constructor(private shoppingCartService: ShoppingCartService, private paymentService: PaymentService,private productsService: ProductsService,private authService: AuthService, private customerService: CustomerService,private router: Router) {const user = this.authService.getCurrentUser();
    this.userId = user && user.user_id != null ? user.user_id : null; }

  ngOnInit() {
    this.paymentService.initializeStripeElement();
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
          this.calculateTotalAmount();
        });
        
      });
      
    }
    
  }

  calculateTotalAmount(): void {
    this.totalAmount = this.cartItemsArray.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  handlePayment(): void {
    if (this.totalAmount > 0) {
      this.paymentService.createPaymentIntent(this.totalAmount * 100)
        .then(clientSecret => {
          return this.paymentService.processPayment(clientSecret);
        })
        .then(paymentMethod => {
          this.onPurchaseComplete();
        })
        .catch(error => {
          console.error('Payment failed:', error);
        });
    }
  }

  onPurchaseComplete(): void {
    this.paymentService.processPayment(this.totalAmount.toString())
      .then(paymentMethod => {
        this.updateProductQuantities();
        if(this.userId){
          this.addFidelityPoints(this.totalAmount, this.userId);
        const purchase: Purchase = {
          customer_id: this.userId,
          date: new Date(), 
          total_amount: this.totalAmount,
          items: this.cartItemsArray.map(item => item.product)
        };
        this.customerService.addToPurchase(purchase).subscribe(
          (response) => {
            console.log('Purchase added:', response);
            if(this.userId){
            this.shoppingCartService.clearCartForUser(this.userId).subscribe(() => {
              this.cartItemsArray = [];
              this.calculateTotalAmount();  
            });}
          },
          (error) => {
            console.error('Error adding purchase:', error);
          }
        );
        console.log('Payment success:', paymentMethod);
        this.router.navigate(['/']);
      }})
      .catch(error => {
        console.error('Payment failed:', error);
      });
  }
  

  private updateProductQuantities(): void {
    this.cartItemsArray.forEach(item => {
      if (item.product?.product_id !== undefined) {
        this.productsService.reduceProductQuantity(item.product.product_id, item.quantity).subscribe(
          (response) => {
            console.log('Patch request response:', response);
          },
          (error) => {
            console.error('Error sending patch request:', error);
          }
        );
      } else {
      }
    });
  }

  calculateFidelityPoints(amountSpent: number): number {
    const pointsPerUnit = 0.1;
    return amountSpent * pointsPerUnit;
}

addFidelityPoints(amountSpent: number, customerId: number): void {
  const points = this.calculateFidelityPoints(amountSpent);
  this.customerService.addPointsToCustomer(customerId, points).subscribe({
      next: (response) => console.log('Points added successfully', response),
      error: (error) => console.error('Error adding points', error)
  });
}
}
