
export interface ReceiptItem {
  product_id?: number; 
  service_id?: number; 
  name: string;
  price_per_unit: number;
  total_price?: number;
  quantity: number; 
  duration?: number; 
  type: 'product' | 'service';
}


export interface Receipt {
  receipt_id?: number;
  id?: number;
  seller_id: number;
  customer_name: string;
  items: ReceiptItem[];
  discount: number;
  paymentMethod: 'card' | 'check' | 'species' | '';
  promoCode?: string;
  total: number;
  date?: Date;
}
