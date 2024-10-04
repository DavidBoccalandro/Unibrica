import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = `${environment.envVar.API_URL}/clients`;

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl + '/all', { withCredentials: true });
  }

  createClient(client: any) {
    return this.http.post(this.apiUrl + '/newClient', client, { withCredentials: true });
  }

  updateClient(client: Client | null, oldClientId: number) {
    return this.http.put(`${this.apiUrl}/${oldClientId}`, client, { withCredentials: true });
  }
}
