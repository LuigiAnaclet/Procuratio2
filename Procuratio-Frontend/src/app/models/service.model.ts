export interface Service {
    service_id?: number;
    name: string;
    duration: number;
    price: number;
    composition: string;
    supplier?: string;
    service_date:Date;
  }
  