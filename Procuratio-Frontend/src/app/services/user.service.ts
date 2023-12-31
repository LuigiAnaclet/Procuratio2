
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl: string = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) {}

  register(user: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/register`, user);
  }

  login(user: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/login`, user);
  }

  getUser(email: string) {
    return this.httpClient.get<User>(`${this.baseUrl}/getUser/${email}`);
  }

  getEmployees(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.baseUrl}/getEmployees/`);
  }

  getCustomers() {
    return this.httpClient.get<User[]>(`${this.baseUrl}/getCustomers/`);
  }
  getAllCustomers() {
    return this.httpClient.get<Customer[]>(`${this.baseUrl}/getAllCustomers/`);
  }
}
