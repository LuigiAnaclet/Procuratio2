import { Component } from '@angular/core';
import { Service } from '../models/service.model';
import { ServicesService } from '../services/services.service';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss']
})
export class AddServiceComponent {
  service: Service = {
    name: '',
    duration: 0,
    price: 0,
    composition:" ",
    service_date: new Date(),
  };

  constructor(private serviceService: ServicesService) { }

  ngOnInit(): void {
  }

  addService() {
    this.serviceService.createService(this.service).subscribe(data => {
      console.log('Service added!', data);
    });
  }
}
