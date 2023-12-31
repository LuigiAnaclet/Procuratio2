import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';

@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.scss']
})
export class AppointmentCalendarComponent implements OnInit {
  appointments: any[] = [];
  currentUser: User | null = null;
  calendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: this.appointments,
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(private appointmentService: AppointmentService,public authService: AuthService, public dialog: MatDialog) {}

  ngOnInit(): void {
    //this.fetchAppointments();
    this.currentUser = this.authService.getCurrentUser();
    this.fetchAppointmentsPerUser();
  }

  

  fetchAppointmentsPerUser(): void {
    if(this.currentUser && this.currentUser.user_id){
    this.appointmentService.getAppointmentsPerUser(this.currentUser.user_id).subscribe({
      next: (data: any[]) => {
        this.appointments = data.map(appointment => {
          return {
            title: `${appointment.serviceName} - ${appointment.customerName} - ${appointment.employeeName}`,
            start: appointment.appointment_date,
            end: new Date(new Date(appointment.appointment_date).getTime() + appointment.duration * 60000),
            extendedProps: {
              appointment_id: appointment.appointment_id,
              serviceName: appointment.serviceName,
              customerName: appointment.customerName,
              employeeName: appointment.employeeName,
              appointment_date: appointment.appointment_date
            }
          };
        });
        this.calendarOptions = {
          plugins: [dayGridPlugin],
          initialView: 'dayGridMonth',
          events: this.appointments,
          eventClick: this.handleEventClick.bind(this)
        };
      },
      error: (error) => {
        console.error('Error fetching appointments:', error);
      }
    });}
  }

  fetchAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (data: any[]) => {
        this.appointments = data.map(appointment => {
          return {
            title: `${appointment.serviceName} - ${appointment.customerName} - ${appointment.employeeName}`,
            start: appointment.appointment_date,
            end: new Date(new Date(appointment.appointment_date).getTime() + appointment.duration * 60000),
            extendedProps: {
              serviceName: appointment.serviceName,
              customerName: appointment.customerName,
              employeeName: appointment.employeeName,
              appointment_date: appointment.appointment_date
            }
          };
        });
        this.calendarOptions = {
          plugins: [dayGridPlugin],
          initialView: 'dayGridMonth',
          events: this.appointments,
          eventClick: this.handleEventClick.bind(this)
        };
      },
      error: (error) => {
        console.error('Error fetching appointments:', error);
      }
    });
  }

  handleEventClick(arg: any): void {
    const appointment = arg.event.extendedProps;
    console.log('Event data:', appointment); // Add this line to check the appointment data
  
    this.dialog.open(AppointmentDialogComponent, {
      width: '250px',
      data: appointment
    }).afterClosed().subscribe(result => {
      if (result) {
        this.fetchAppointmentsPerUser();
      }
    });
  }
}
