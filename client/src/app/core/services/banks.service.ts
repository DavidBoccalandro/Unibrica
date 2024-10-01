import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class BanksService {
  private BanksUrl = `${environment.envVar.API_URL}/banks`;
  constructor(public http: HttpClient) {}

  getBanks(): Observable<any> {
    return this.http.get<any>(`${this.BanksUrl}/all`, { withCredentials: true });
  }
}
