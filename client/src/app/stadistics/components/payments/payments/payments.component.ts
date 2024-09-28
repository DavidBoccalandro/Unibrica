import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { MatTableDataSourceInput } from 'src/app/shared/table/table.component';
import { StadisticsService, StatisticsParams2 } from 'src/app/stadistics/stadistics.service';
import { FilterService } from '../../../../core/services/filter.service';
import { Sheet } from 'src/app/shared/interfaces/sheet.interface';
import { generatePaymentExcel } from '../utils/generatePaymentExcel.util';
import { FilterInExcel } from 'src/app/shared/interfaces/filterInExcel.interface';
import { Client } from '../../clients/clients.interfaces';

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
  debtAmount: number;
  chargedAmount: number;
  remainingDebt: number;
  sheet: Sheet;
  client?: Client;
  rejectCode?: string;
  rejectText?: string;
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
    'client.name',
    // 'creditCompany',
    'companyAccountNumber',
    'bankAccountNumber',
    'debitDate',
    'sheet.date',
    'bank.bankId',
    // 'customerAccountType',
    'branchCode',
    // 'debitSequence',
    // 'installmentNumber',
    'debitStatus',
    'debtAmount',
    'chargedAmount',
    'remainingDebt',
    'rejectCode',
    'rejectText',
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
        if (!value) {
          this.resetParams();
        } else {
          const newParams = { ...this.params.getValue(), ...value, offset: 0 };
          // this.paginator.pageIndex = 0;
          this.params.next(newParams);
        }
      })
    );

    this.subscriptions.push(
      this.filterService.filterDescriptions$.subscribe((data) => {
        if(data !== null) {
          this.generateExcel(data);
        }
      })
    );
  }

  resetParams() {
    if (this.paginator) {
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
        // console.log('PAYMENTS: ', data)
        this.payments = data.payments;
        this.totalItems = data.totalItems;
        this.tableData = new MatTableDataSource<MatTableDataSourceInput>(this.payments);
        this.clickableColumns = new Set<string>([this.tableColumns[0]]);
      });
  }

  handleClick(page: PageEvent) {
    this.params.next({
      ...this.params.getValue(),
      limit: page.pageSize,
      offset: page.pageIndex * page.pageSize,
    });
  }

  generateExcel(filters: FilterInExcel[]) {
    this.statisticsService
      .getAllPaymentsWithoutPagination(this.params.getValue())
      .pipe(take(1))
      .subscribe((data) => {
        const allPayments = data.payments;
        generatePaymentExcel(allPayments, filters);
      });

    this.filterService.resetExportToExcel();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
