import { Product } from "./product.model";

export interface CartItem {
    cart_id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    product?: Product;
  }