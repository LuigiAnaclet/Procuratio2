export interface Purchase {
    purchase_id?: number;
    customer_id: number;
    date: Date;
    total_amount: number;
    items: any[];
  }
  