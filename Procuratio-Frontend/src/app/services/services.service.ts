import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private baseUrl: string = 'https://procuratio-lanaclet.francecentral.cloudapp.azure.com:443/api/services';

  constructor(private http: HttpClient) {}

  getServices() {
    return this.http.get<Service[]>(this.baseUrl);
  }

  getServiceById(id: number) {
    return this.http.get<Service>(`${this.baseUrl}/${id}`);
  }

  createService(service: Service) {
    return this.http.post<Service>(this.baseUrl, service);
  }

  updateService(id: number, service: Service) {
    return this.http.put<Service>(`${this.baseUrl}/${id}`, service);
  }

  deleteService(id: number) {
    return this.http.delete<Service>(`${this.baseUrl}/${id}`);
  }
}
