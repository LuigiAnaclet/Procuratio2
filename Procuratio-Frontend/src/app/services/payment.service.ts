import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) {}
  private baseUrl: string = 'http://localhost:3000';
  private stripePromise = loadStripe('pk_test_51ORIjCIP5xW4dG0q7hN52XTpydJutuYcoLZSr3s3SO8wOJUJey3LlaPVLhlqulqb3FxSCKXs05iZNuYxpw3cCqxt00PuIE7KuP');
  private cardElement: StripeCardElement | undefined;

  async initializeStripeElement(): Promise<void> {
    const stripe = await this.stripePromise;
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    const elements = stripe.elements();
    
    this.cardElement = elements.create('card');
    this.cardElement.mount('#card-element');
  }

  async processPayment(clientSecret: string): Promise<any> {
    const stripe = await this.stripePromise;
    if (!stripe || !this.cardElement) {
      throw new Error('Stripe not initialized');
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
    });

    if (error) {
      console.log('[error]', error);
      throw error;
    } else {
      //console.log('[PaymentMethod]', paymentMethod);
      return paymentMethod;
    }
  }

  async createPaymentIntent(amount: number): Promise<string> {
    const response = await this.http.post<{ clientSecret: string }>(
      `${this.baseUrl}/create-payment-intent`, 
      { amount }
    ).toPromise();
  
    if (!response) {
      throw new Error('Failed to create payment intent');
    }
  
    return response.clientSecret;
  }
}
