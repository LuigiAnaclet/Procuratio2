import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private baseUrl = 'http://procuratio-lanaclet.francecentral.cloudapp.azure.com:3000/api/campaigns';

  constructor(private http: HttpClient) { }

  createCampaign(campaignData: any): Observable<any> {
    return this.http.post(this.baseUrl, campaignData);
  }
}
