import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FilterValues } from './components/filter/filter.interfaces';
import { NavigationExtras, Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/enviroments/enviroment';
import { Debtor } from './components/debtors/debtors.interface';
import { Client } from './components/clients/clients.interfaces';
import { Payment } from './components/payments/payments/payments.component';

interface StatisticsParams {
  limit: number;
  offset: number;
  filterBy?: string;
  filterValue?: string;
}

@Injectable()
export class StadisticsService {

  private DebtsUrl = `${environment.envVar.API_URL}/debts`;
  private DebtorsUrl = `${environment.envVar.API_URL}/debtors`;
  private ClientsUrl = `${environment.envVar.API_URL}/clients`;
  private PaymentsUrl = `${environment.envVar.API_URL}/payment`;

  params$!: Observable<Params>;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private http: HttpClient) {
    this.params$ = this.activatedRoute.queryParams;
  }

  getParams():Observable<Params> {
    return this.params$
  }

  getAllDebts(params: StatisticsParams): Observable<any> {
    const url =`${this.DebtsUrl}/all?limit=${params.limit}&offset=${params.offset}&filterBy=${params.filterBy ?? 'idDebt'}&filterValue=${params.filterValue}`
    return this.http.get<any>(url, { withCredentials: true });
  }

  getAllDebtors(params: StatisticsParams): Observable<{totalItems: number, debtors: Debtor[]}> {
    const url =`${this.DebtorsUrl}?limit=${params.limit}&offset=${params.offset}&filterBy=${params.filterBy ?? 'firstNames'}&filterValue=${params.filterValue}`
    return this.http.get<any>(url, { withCredentials: true });
  }

  getAllClients(): Observable<Client[]> {
    return this.http.get<any>(`${this.ClientsUrl}/all`, { withCredentials: true });
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<any>(`${this.PaymentsUrl}`, { withCredentials: true });
  }

  navigateWithQueryParams(pageInfo: PageEvent, filters: FilterValues, route: string): void {
    const queryParams: any = {
      pageIndex: pageInfo.pageIndex || 1,
      pageSize: pageInfo.pageSize || 25,
    };

    if (filters.search) {
      queryParams.search = filters.search;
    }

    if (filters.searchField) {
      queryParams.searchField = filters.searchField;
    }

    if (filters.rangeStart) {
      queryParams.rangeStart = filters.rangeStart.setHours(0,0,0,0);
    }

    if (filters.rangeEnd) {
      queryParams.rangeEnd = filters.rangeEnd.setHours(0,0,0,0);
    }
    const navigationExtras: NavigationExtras = {
      queryParams,
    };
    this.router.navigate([`estadisticas/${route}`], navigationExtras);
  }
}
