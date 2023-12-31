import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppointmentService } from '../services/appointment.service';

@Component({
  selector: 'app-appointment-dialog',
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss']
})
export class AppointmentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appointmentService: AppointmentService
  ) { }

  onDelete(): void {
    this.appointmentService.deleteAppointment(this.data.appointment_id).subscribe({
      next: () => {
        this.dialogRef.close(true); 
      },
      error: (error) => console.error('Error deleting appointment:', error)
    });
  }
}
