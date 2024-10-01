import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';
import { environment } from 'src/environments/environment';

@Injectable()
export class ClientsService {
  private ClientsUrl = `${environment.envVar.API_URL}/clients`;
  constructor(public http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.ClientsUrl}/all`, {withCredentials: true});
  }
}
