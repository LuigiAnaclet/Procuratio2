import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { CustomerService } from '../services/customer.service';
import { UserService } from '../services/user.service';
import { Customer } from '../models/customer.model';
import { Purchase } from '../models/purchase.model';
import { AppointmentService } from '../services/appointment.service';
import { Appointment } from '../models/appointment.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-customer-file',
  templateUrl: './customer-file.component.html',
  styleUrls: ['./customer-file.component.scss']
})
export class CustomerFileComponent implements OnInit {
  customerControl = new FormControl();
  customers: Customer[] = []; 
  filteredCustomers: Observable<Customer[]> = of([]);
  selectedCustomer: Customer | null = null; 
  purchases:Purchase[] =[];
  appointments: Appointment[]= [];
  isEmployee!: boolean;

  constructor(private customerService: CustomerService,private userService: UserService,private appointmentService: AppointmentService,
    private authService: AuthService) {}

  ngOnInit(): void {

    const currentUser = this.authService.getCurrentUser();
    this.isEmployee = this.authService.isEmployee();
    
    if (!this.isEmployee && currentUser && currentUser.user_id) {
      this.loadCustomerDetails(currentUser.user_id);
    } else {
      this.userService.getAllCustomers().subscribe(customers => {
        this.customers = customers;
        this.setupFilter();
      });
    }
    
  }

  private setupFilter(): void {
    this.filteredCustomers = this.customerControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterCustomers(name) : this.customers.slice())
    );
  }

  private filterCustomers(name: string): Customer[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(customer => 
      (customer.first_name.toLowerCase().includes(filterValue) ||
      customer.last_name.toLowerCase().includes(filterValue))
    );
  }

  displayFn(customer: Customer): string {
    return customer && customer.first_name && customer.last_name ? `${customer.first_name} ${customer.last_name}` : '';
  }

  private loadCustomerDetails(userId: number): void {
    this.customerService.getCustomerDetails(userId).subscribe(customerArray => {
      this.selectedCustomer = Array.isArray(customerArray) && customerArray.length > 0 ? customerArray[0] : null;
      //console.log(this.selectedCustomer);
      if (this.selectedCustomer && this.selectedCustomer.user_id) {
        this.fetchCustomerDetails(this.selectedCustomer.user_id);
      }
    });
  }

  onCustomerSelected(customer: Customer): void {
    this.selectedCustomer = customer;
    if(this.selectedCustomer.user_id){
      this.fetchCustomerDetails(this.selectedCustomer.user_id);
    }
  }

  private filterUpcomingAppointments(appointments: Appointment[]): Appointment[] {
    const now = new Date();
    return appointments.filter(appointment => new Date(appointment.appointment_date) > now);
  }

  private fetchCustomerDetails(customerId: number): void {
    // Fetch purchases
    this.customerService.getCustomerPurchases(customerId).subscribe(purchases => {
      this.purchases = purchases;
    });

    // Fetch appointments
    this.appointmentService.getAppointmentsPerUser(customerId).subscribe(appointments => {
      this.appointments = this.filterUpcomingAppointments(appointments);
    });


  }
  }
