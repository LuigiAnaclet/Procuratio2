export interface Appointment {
    appointment_id: number;
    customer_id: number;
    service_id: number;
    employee_id: number;
    appointment_date: Date;
    duration: number;
    serviceName?:string;
  }
  