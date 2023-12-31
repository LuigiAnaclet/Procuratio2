import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private baseUrl = 'https://procuratio-lanaclet.francecentral.cloudapp.azure.com/api/campaigns';

  constructor(private http: HttpClient) { }

  createCampaign(campaignData: any): Observable<any> {
    return this.http.post(this.baseUrl, campaignData);
  }
}
