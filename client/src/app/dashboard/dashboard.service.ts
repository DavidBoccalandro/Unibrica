import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ChartDataValue,
  LineChartData,
  LineChartDataWithLabels,
  PieAdvancedChartData,
  PieChartData,
  Scheme,
  VerticalBarChartData,
  XYLabels,
} from '../charts/chart.interfaces';
import {
  chartMockedData,
  chartMockedLabels,
  lineChartMockedData,
} from '../charts/mocks/chart-data.mock';
import { CalendarEvent } from 'angular-calendar';
import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
import {
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StatisticsParams2 } from '../stadistics/stadistics.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  paymentURL = '/api/payments';

  constructor(private http: HttpClient) {}

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
}
