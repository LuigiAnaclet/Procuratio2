import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CampaignService } from '../services/campaign.service';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss']
})
export class CampaignFormComponent {
  campaignForm: FormGroup;

  constructor(private fb: FormBuilder, private campaignService: CampaignService) {
    this.campaignForm = this.fb.group({
      title: ['', Validators.required],
      message: ['', Validators.required],
      sendDate: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.campaignForm.valid) {
      this.campaignService.createCampaign(this.campaignForm.value).subscribe(
        response => {
          console.log('Campaign scheduled successfully', response);
        },
        error => {
          console.error('Error scheduling campaign', error);
        }
      );
    }
  }
}
