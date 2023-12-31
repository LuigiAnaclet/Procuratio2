import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model'; // Replace with your user model path

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor() {
    this.currentUserSubject = new BehaviorSubject<User | null>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
  

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
  
  isUserLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isCustomer(): boolean {
    return this.currentUserValue?.role === "customer";
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === "admin";
  }

  isEmployee(): boolean {
    return this.currentUserValue?.role === 'employee';
  }

  getCurrentUserName(): string {
    return this.currentUserValue?.first_name || '';
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user;
    }
    return null;
  }
  
  
}
