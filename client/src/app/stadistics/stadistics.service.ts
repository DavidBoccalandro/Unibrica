import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FilterValues } from './components/filter/filter.interfaces';
import { NavigationExtras, Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Debtor } from './components/debtors/debtors.interface';
import { Client } from './components/clients/clients.interfaces';
import { Payment } from './components/payments/payments/payments.component';
import { Reversal } from './components/reversals/reversals.component';
import { File } from '../files/components/files/files.component';
import { Debt } from './components/debts/debts.interface';

export interface StatisticsParams {
  limit: number;
  offset: number;
  filterBy?: string;
  filterValue?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface StatisticsParams2 {
  limit: number;
  offset: number;
  stringFilters?: { filterBy: string; filterValue: string }[];
  numericFilters?: { filterBy: string; operator: string; filterValue: number }[];
  dateFilters?: { filterBy: string; startDate: Date; endDate: Date }[];
}

export interface StatisticsResponse {
  clientName: string;
  statistics: {
    totalDebtAmount: {
      [key: string]: number;
    };
    totalDebitAmount: {
      [key: string]: number;
    };
    totalRemainingDebt: {
      [key: string]: number;
    };
    totalReversalAmount: {
      [key: string]: number;
    };
  };
}


@Injectable()
export class StadisticsService {
  private DebtsUrl = `${environment.envVar.API_URL}/debts`;
  private DebtorsUrl = `${environment.envVar.API_URL}/debtors`;
  private ClientsUrl = `${environment.envVar.API_URL}/clients`;
  private PaymentsUrl = `${environment.envVar.API_URL}/payment`;
  private ReversalURL = `${environment.envVar.API_URL}/reversal`;
  private SheetsURL = `${environment.envVar.API_URL}/sheets`;
  private StatisticsURL = `${environment.envVar.API_URL}/statistics`;

  params$!: Observable<Params>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient
  ) {
    this.params$ = this.activatedRoute.queryParams;
  }

  getParams(): Observable<Params> {
    return this.params$;
  }

  getAllDebts(params: StatisticsParams2): Observable<any> {
    let httpParams = new HttpParams()
      .set('limit', params.limit.toString())
      .set('offset', params.offset.toString())
      .set('stringFilters', JSON.stringify(params.stringFilters))
      .set('numericFilters', JSON.stringify(params.numericFilters))
      .set('dateFilters', JSON.stringify(params.dateFilters));

    return this.http.get<any>(this.DebtsUrl + '/all', {
      params: httpParams,
      withCredentials: true,
    });
  }

  getAllDebtors(params: StatisticsParams): Observable<{ totalItems: number; debtors: Debtor[] }> {
    const url = `${this.DebtorsUrl}?limit=${params.limit}&offset=${params.offset}&filterBy=${
      params.filterBy ?? 'firstNames'
    }&filterValue=${params.filterValue}`;
    return this.http.get<any>(url, { withCredentials: true });
  }

  getAllClients(): Observable<Client[]> {
    return this.http.get<any>(`${this.ClientsUrl}/all`, { withCredentials: true });
  }

  getAllPayments(
    params: StatisticsParams2
  ): Observable<{ totalItems: number; payments: Payment[] }> {
    let httpParams = new HttpParams()
      .set('limit', params.limit.toString())
      .set('offset', params.offset.toString())
      .set('stringFilters', JSON.stringify(params.stringFilters))
      .set('numericFilters', JSON.stringify(params.numericFilters))
      .set('dateFilters', JSON.stringify(params.dateFilters));

    return this.http.get<{ totalItems: number; payments: Payment[] }>(this.PaymentsUrl, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getAllReversals(
    params: StatisticsParams2
  ): Observable<{ totalItems: number; reversals: Reversal[] }> {
    let httpParams = new HttpParams()
      .set('limit', params.limit.toString())
      .set('offset', params.offset.toString())
      .set('stringFilters', JSON.stringify(params.stringFilters))
      .set('numericFilters', JSON.stringify(params.numericFilters))
      .set('dateFilters', JSON.stringify(params.dateFilters));

    return this.http.get<{ totalItems: number; reversals: Reversal[] }>(this.ReversalURL, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getAllSheets(params: StatisticsParams2): Observable<{ totalItems: number; sheets: File[] }> {
    let httpParams = new HttpParams()
      .set('limit', params.limit.toString())
      .set('offset', params.offset.toString())
      .set('stringFilters', JSON.stringify(params.stringFilters))
      .set('numericFilters', JSON.stringify(params.numericFilters))
      .set('dateFilters', JSON.stringify(params.dateFilters));

    return this.http.get<{ totalItems: number; sheets: File[] }>(this.SheetsURL, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getAllPaymentsWithoutPagination(
    params: StatisticsParams2
  ): Observable<{ totalItems: number; payments: Payment[] }> {
    let httpParams = new HttpParams()
      .set('limit', '')
      .set('offset', '')
      .set('stringFilters', JSON.stringify(params.stringFilters))
      .set('numericFilters', JSON.stringify(params.numericFilters))
      .set('dateFilters', JSON.stringify(params.dateFilters));

    return this.http.get<{ totalItems: number; payments: Payment[] }>(this.PaymentsUrl, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getAllReversalsWithoutPagination(
    params: StatisticsParams2
  ): Observable<{ totalItems: number; reversals: Reversal[] }> {
    let httpParams = new HttpParams()
      .set('limit', '')
      .set('offset', '')
      .set('stringFilters', JSON.stringify(params.stringFilters))
      .set('numericFilters', JSON.stringify(params.numericFilters))
      .set('dateFilters', JSON.stringify(params.dateFilters));

    return this.http.get<{ totalItems: number; reversals: Reversal[] }>(this.ReversalURL, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getAllDebtsWithoutPagination(
    params: StatisticsParams2
  ): Observable<{ totalItems: number; debts: Debt[] }> {
    let httpParams = new HttpParams()
      .set('limit', '')
      .set('offset', '')
      .set('stringFilters', JSON.stringify(params.stringFilters))
      .set('numericFilters', JSON.stringify(params.numericFilters))
      .set('dateFilters', JSON.stringify(params.dateFilters));

    return this.http.get<{ totalItems: number; debts: Debt[] }>(this.DebtsUrl + '/all', {
      params: httpParams,
      withCredentials: true,
    });
  }

  getStatisticsOfMonth(params: { startDate: Date; endDate: Date }): Observable<StatisticsResponse[]> {
    const { startDate, endDate } = params;
    let httpParams = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    const url = `${this.StatisticsURL}/monthly`;
    return this.http.get<StatisticsResponse[]>(url, { withCredentials: true, params: httpParams });
  }

  getEfficiencyRecovery(params: { startDate: Date; endDate: Date }): Observable<any> {
    const { startDate, endDate } = params;
    let httpParams = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    const url = `${this.StatisticsURL}/monthly`;
    return this.http.get<any>(url, { withCredentials: true, params: httpParams });
  }

  // getPaymentsByClientAndDateRange(
  //   params: StatisticsParams2
  // ): Observable<any> {
  //   let httpParams = new HttpParams()
  //   .set('stringFilters', JSON.stringify(params.stringFilters))
  //   .set('numericFilters', JSON.stringify(params.numericFilters))
  //   .set('dateFilters', JSON.stringify(params.dateFilters));

  // return this.http.get<{ totalItems: number; payments: Payment[] }>(this.PaymentsUrl, {
  //   params: httpParams,
  //   withCredentials: true,
  // });
  //   return this.http.get(this.paymentURL, {
  //     params: { startDate, endDate },
  //   });
  // }

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
      queryParams.rangeStart = filters.rangeStart.setHours(0, 0, 0, 0);
    }

    if (filters.rangeEnd) {
      queryParams.rangeEnd = filters.rangeEnd.setHours(0, 0, 0, 0);
    }
    const navigationExtras: NavigationExtras = {
      queryParams,
    };
    this.router.navigate([`estadisticas/${route}`], navigationExtras);
  }
}
