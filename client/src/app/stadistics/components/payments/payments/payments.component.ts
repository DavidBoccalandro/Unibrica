import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, debounceTime, Subscription, take } from 'rxjs';
import { MatTableDataSourceInput } from 'src/app/shared/table/table.component';
import { StadisticsService, StatisticsParams2 } from 'src/app/stadistics/stadistics.service';
import { FilterService } from '../../../../core/services/filter.service';
import { Sheet } from 'src/app/shared/interfaces/sheet.interface';

export interface Payment {
  id: number;
  recordType: number;
  agreementNumber: number;
  creditCompany: number;
  companyAccountNumber: string;
  debitDate: string;
  subscriberID: number;
  bank?: { bankId: string };
  customerAccountType: number;
  branchCode: number;
  bankAccountNumber: string;
  debitSequence: number;
  installmentNumber: number;
  debitStatus: string;
  chargedAmount: number;
  sheet: Sheet
}



@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent {
  payments!: Payment[];
  tableData!: MatTableDataSource<MatTableDataSourceInput>;
  tableColumns: string[] = [
    // 'id',
    // 'recordType',
    'agreementNumber',
    // 'creditCompany',
    'companyAccountNumber',
    'bankAccountNumber',
    'debitDate',
    'fileDate',
    'bank',
    'customerAccountType',
    'branchCode',
    'debitSequence',
    'installmentNumber',
    'debitStatus',
    'debtAmount',
    'chargedAmount',
  ];
  clickableColumns = new Set<string>([this.tableColumns[0]]);
  subscriptions: Subscription[] = [];
  params = new BehaviorSubject<StatisticsParams2>({
    limit: 10,
    offset: 0,
  });
  $params = this.params.asObservable();
  totalItems = 0;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private statisticsService: StadisticsService, private filterService: FilterService) {
    this.$params.subscribe(() => this.fetchPayments());

    this.subscriptions.push(
      this.filterService.filters$.subscribe((value) => {
        if(!value) {
          this.resetParams()
        }
        const newParams = {...this.params.getValue(), ...value}
        this.params.next(newParams);
      })
    )
  }

  resetParams() {
    if(this.paginator) {
      const currentPageSize = this.paginator?.pageSize ?? 10;
      this.params.next({ offset: 0, limit: 10 });
      this.paginator.pageIndex = 0;
    }
  }

  fetchPayments(): void {
    this.statisticsService
      .getAllPayments(this.params.getValue())
      .pipe(take(1))
      .subscribe((data) => {
        console.log('PAYMENTS: ', data)
        this.payments = data.payments;
        this.totalItems = data.totalItems;
        this.tableData = new MatTableDataSource<MatTableDataSourceInput>(this.payments);
        this.clickableColumns = new Set<string>([this.tableColumns[0]]);
      });
  }

  formatData(data: Payment[]) {

  }
  handleClick(page: PageEvent) {
    this.params.next({
      ...this.params.getValue(),
      limit: page.pageSize,
      offset: page.pageIndex * page.pageSize,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
