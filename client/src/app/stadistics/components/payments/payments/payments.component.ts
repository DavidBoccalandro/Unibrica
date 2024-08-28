import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatTableDataSourceInput } from 'src/app/shared/table/table.component';
import { StadisticsService } from 'src/app/stadistics/stadistics.service';

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
    'id',
    'recordType',
    'agreementNumber',
    'creditCompany',
    'companyAccountNumber',
    'debitDate',
    'subscriberID',
    'bank',
    'customerAccountType',
    'branchCode',
    'bankAccountNumber',
    'debitSequence',
    'installmentNumber',
    'debitStatus',
    'chargedAmount',
  ];
  clickableColumns = new Set<string>([this.tableColumns[0]]);
  subscriptions: Subscription[] = [];
  params!: Params;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private statisticsService: StadisticsService) {
    this.subscriptions.push(
      this.statisticsService.getParams().subscribe((params) => {
        this.params = params;
      })
    );

    this.subscriptions.push(
      this.statisticsService.getAllPayments().subscribe((payments) => {
        this.payments = payments;
        this.tableData = new MatTableDataSource<MatTableDataSourceInput>(this.payments);
        this.clickableColumns = new Set<string>([this.tableColumns[0]]);
        this.tableData.paginator = this.paginator;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
