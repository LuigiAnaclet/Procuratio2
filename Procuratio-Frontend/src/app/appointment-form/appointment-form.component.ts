import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { Service } from '../models/service.model';
import { User } from '../models/user.model';
import { AppointmentService } from '../services/appointment.service';
import { AuthService } from '../services/auth.service';
import { ServicesService } from '../services/services.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent implements OnInit {
  @Output() appointmentSaved = new EventEmitter<void>();
  employees: User[] = [];
  customers: User[] = [];
  selectedEmployeeId: number | null = null;
  selectedCustomerId: number | null = null;
  currentUser: User | null = null;
  services: Service[]=[];
  appointmentNotAvailable: boolean = false;

  appointmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private authService: AuthService,private userService: UserService, private servicesService: ServicesService
  ) {
    this.appointmentForm = this.fb.group({
      customer_id: ['', Validators.required],
      service_id: ['', Validators.required],
      employee_id: [{ value: '', disabled: true }, Validators.required],
      appointment_date: ['', [Validators.required, this.noWeekendValidator, this.businessHoursValidator]],
      duration: ['', [Validators.required, Validators.min(1)]],
      reminderEmail: [false],
      reminderSms: [false],
      reminderTimeFrame: ['24']
    });
  }

noWeekendValidator(control: AbstractControl): ValidationErrors | null {
  const date = new Date(control.value);
  if (date.getDay() === 0 || date.getDay() === 6) {
    return { weekend: true };
  }
  return null;
}
businessHoursValidator(control: AbstractControl): ValidationErrors | null {
  const time = new Date(control.value);
  const hours = time.getHours();
  if (hours < 9 || hours > 17) {
    return { businessHours: true };
  }
  return null;
}


  ngOnInit(): void {
    this.servicesService.getServices().subscribe(
      (data) => {
        this.services = data;
      },
      (error) => {
        console.error('There was an error retrieving employees!', error);
      });
    this.currentUser = this.authService.getCurrentUser();

    if (this.authService.isEmployee() && this.currentUser) {
      if(this.currentUser.user_id){
        this.selectedEmployeeId = this.currentUser.user_id;
        this.appointmentForm.get('employee_id')?.setValue(this.currentUser.user_id);
        this.appointmentForm.get('employee_id')?.disable();
      }
      this.userService.getCustomers().subscribe(
        (data) => {
          this.customers = data;
        },
        (error) => {
          console.error('There was an error retrieving employees!', error);
        })
        
    } else if (this.authService.isCustomer() && this.currentUser) {
      this.appointmentForm.get('employee_id')?.enable();
      if(this.currentUser.user_id){
        this.selectedCustomerId = this.currentUser.user_id;
      }

      this.appointmentForm.get('customer_id')?.setValue(this.currentUser.user_id);
      this.userService.getEmployees().subscribe(
        (data) => {
          this.employees = data;
        },
        (error) => {
          console.error('There was an error retrieving employees!', error);
        }
      );
    }
  }

  validateAppointmentDate(control: AbstractControl): ValidationErrors | null {
    const day = (control.value && new Date(control.value).getDay()) || 0;
    if (day === 0 || day === 6) {
      return { 'weekend': true };
    }
    return null;
  }

  saveAppointment(): void {
    if (this.appointmentForm.valid) {
      this.appointmentService.checkAppointmentAvailability(this.appointmentForm.value).subscribe({
        next: (isAvailable) => {
          if (isAvailable) {
            console.log(this.appointmentForm.value);
            this.appointmentForm.get('employee_id')?.enable();
            this.appointmentService.saveAppointment(this.appointmentForm.value).subscribe({
              next: () => {
                this.appointmentSaved.emit();
              },
              error: (error) => {
                console.error('Error saving appointment:', error);
              }
            });
            this.appointmentSaved.emit();
            this.appointmentForm.get('employee_id')?.disable();
          } else {
            this.appointmentNotAvailable = true;
          }
        },
        error: (error) => {
          console.error('Error checking appointment availability:', error);
        }
      });
    }
  }
}
