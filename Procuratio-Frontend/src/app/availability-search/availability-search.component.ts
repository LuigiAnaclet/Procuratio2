import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../services/appointment.service';
import { UserService } from '../services/user.service';
import { ServicesService } from '../services/services.service';
import { User } from '../models/user.model';
import { Service } from '../models/service.model';

@Component({
  selector: 'app-availability-search',
  templateUrl: './availability-search.component.html',
  styleUrls: ['./availability-search.component.scss']
})
export class AvailabilitySearchComponent implements OnInit {
  searchForm: FormGroup;
  employees: User[] = [];
  services: Service[] = [];
  availableSlots: Date[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private servicesService: ServicesService
  ) {
    this.searchForm = this.fb.group({
      service_id: ['', Validators.required],
      employee_id: ['', Validators.required],
      desired_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadServices();
  }

  loadEmployees(): void {
    this.userService.getEmployees().subscribe(
      employees => this.employees = employees,
      error => console.error('Error loading employees:', error)
    );
  }

  loadServices(): void {
    this.servicesService.getServices().subscribe(
      services => this.services = services,
      error => console.error('Error loading services:', error)
    );
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      const { service_id, employee_id, desired_date } = this.searchForm.value;
      this.appointmentService.getAvailableSlots(service_id, employee_id, desired_date)
        .subscribe(
          slots => this.availableSlots = slots,
          error => console.error('Error fetching available slots:', error)
        );
    }
  }
}
