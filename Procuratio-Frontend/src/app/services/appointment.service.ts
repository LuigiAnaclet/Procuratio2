import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseUrl = 'http://localhost:3000/api/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl);
  }

  getAppointmentsPerUser(userId : number): Observable<any> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/user/${userId}`);
  }
  saveAppointment(appointment: Appointment): Observable<Appointment> {
    if (appointment.appointment_id) {
      return this.http.put<Appointment>(`${this.baseUrl}/${appointment.appointment_id}`, appointment);
    } else {
      return this.http.post<Appointment>(this.baseUrl, appointment);
    }
  }
  getAvailableSlots(service_id: number, user_id: number, desired_date: string): Observable<any> {
    const params = new HttpParams()
      .set('service_id', service_id.toString())
      .set('user_id', user_id.toString())
      .set('desired_date', desired_date);
  
    return this.http.get(`${this.baseUrl}/availability`, { params });
  }

  deleteAppointment(id: number) {
    return this.http.delete<Appointment>(`${this.baseUrl}/${id}`);
  }

  checkAppointmentAvailability(appointment: any): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/check-availability`, appointment);
  }

}
