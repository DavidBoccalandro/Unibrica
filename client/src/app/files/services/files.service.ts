import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { NavigationExtras, Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/enviroments/enviroment';
import { Sheet } from 'src/app/shared/interfaces/sheet.interface';
import { File } from '../components/files/files.component';
import { RepeatedDebtor } from '../components/file-log/file-log.component';

export interface ParamsWithFilters {
  limit: number;
  offset: number;
  stringFilters?: { filterBy: string; filterValue: string }[];
  numericFilters?: { filterBy: string; operator: string; filterValue: number }[];
  dateFilters?: { filterBy: string; startDate: Date; endDate: Date }[];
}

@Injectable()
export class FilesService {
  private SheetsURL = `${environment.envVar.API_URL}/sheets`;
  private RepDebtorURL = `${environment.envVar.API_URL}/repeated_debtors`;

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

  getAllSheets(
    params: ParamsWithFilters
  ): Observable<{ totalItems: number; sheets: File[] }> {
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

  getAllRepeatedDebtors(
    params: ParamsWithFilters
  // ): Observable<{ totalItems: number; repeatedDebtors: RepeatedDebtor[] }> {
  ): Observable<RepeatedDebtor[]> {
    let httpParams = new HttpParams()
      .set('limit', params.limit.toString())
      .set('offset', params.offset.toString())
      .set('stringFilters', JSON.stringify(params.stringFilters))
      .set('numericFilters', JSON.stringify(params.numericFilters))
      .set('dateFilters', JSON.stringify(params.dateFilters));

    return this.http.get<RepeatedDebtor[]>(this.RepDebtorURL + '/all', {
      params: httpParams,
      withCredentials: true,
    });
  }

  downloadSheet(filename: string) {
    return this.http.get(this.SheetsURL + '/download/' + filename, {
      responseType: 'blob'
    });
  }
}
