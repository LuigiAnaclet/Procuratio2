import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Service } from '../models/service.model';
import { ServicesService } from '../services/services.service';

@Component({
  selector: 'app-edit-service-dialog',
  templateUrl: './edit-service-dialog.component.html',
  styleUrls: ['./edit-service-dialog.component.scss']
})
export class EditServiceDialogComponent {
  selectedService?: Service;
  selectedFile: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: Service },
    private servicesService: ServicesService,
    private snackBar: MatSnackBar
  ) {
    this.selectedService = Object.assign({}, data.service);
  }

  onSave(): void {
    if (this.selectedService && this.selectedService.service_id) {
      this.servicesService.updateService(this.selectedService.service_id, this.selectedService).subscribe(updatedService => {
      
        this.snackBar.open('Service updated successfully!', 'Close', {
          duration: 2000, 
        });
        this.dialogRef.close(updatedService);

      }, (error: any) => {
        console.error('There was an error updating the Service:', error);
        this.snackBar.open('Failed to update the Service. Please try again.', 'Close', {
          duration: 3000, 
        });
      });
    } else {
      console.error('Service ID is missing. Cannot update.');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  
}
