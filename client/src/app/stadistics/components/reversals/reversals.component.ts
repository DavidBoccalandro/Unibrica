import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, BehaviorSubject, debounceTime, take } from 'rxjs';
import { FilterService } from 'src/app/core/services/filter.service';
import { MatTableDataSourceInput } from 'src/app/shared/table/table.component';
import { StatisticsParams, StadisticsService } from '../../stadistics.service';

export interface Reversal {
  id: number;
  agreementNumber: number;
  serviceNumber: string;
  companyNumber: string;
  bank?: { bankId: string };
  branchCode: number;
  accountType: number;
  accountNumber: string;
  currentID: string;
  debitID: string;
  movementFunction: string;
  rejectionCode: string;
  dueDate: Date;
  debitAmount: number;
}

@Component({
  selector: 'app-reversals',
  templateUrl: './reversals.component.html',
  styleUrls: ['./reversals.component.scss']
})

export class ReversalsComponent {
  reversals!: Reversal[];
  tableData!: MatTableDataSource<MatTableDataSourceInput>;
  tableColumns: string[] = [
    // 'id',
    // 'recordType',
    'agreementNumber',
    // 'serviceNumber',
    'companyNumber',
    'bank',
    'branchCode',
    'accountType',
    'accountNumber',
    'currentID',
    'debitID',
    // 'movementFunction',
    // 'rejectionCode',
    'dueDate',
    'debitAmount'
  ];
  clickableColumns = new Set<string>([this.tableColumns[0]]);
  subscriptions: Subscription[] = [];
  params = new BehaviorSubject<StatisticsParams>({
    limit: 5,
    offset: 0,
  });
  $params = this.params.asObservable();
  totalItems = 0;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private statisticsService: StadisticsService, private filterService: FilterService) {
    this.$params.subscribe(() => this.fetchReversals());

    this.subscriptions.push(
      this.filterService.searchValue$.pipe(debounceTime(500)).subscribe((searchValue) => {
        const newParams = { ...this.params.getValue(), filterValue: searchValue };
        this.params.next(newParams);
        this.resetParams();
        this.fetchReversals();
      })
    );

    this.subscriptions.push(
      this.filterService.searchField$.subscribe((value) => {
        const newParams = { ...this.params.getValue(), filterBy: value };
        this.params.next(newParams);
        this.fetchReversals();
      })
    );

    this.subscriptions.push(
      this.filterService.rangeStart$.subscribe((startDate) => {
        // const newParams = { ...this.params.getValue(), startDate, date: 'createdAt' };
        const newParams = {
          ...this.params.getValue(),
          date: 'createdAt',
          startDate: startDate ? startDate.toISOString() : undefined,
        };
        this.params.next(newParams);
        this.resetParams();
      })
    );

    this.subscriptions.push(
      this.filterService.rangeEnd$.subscribe((endDate) => {
        const newParams = {
          ...this.params.getValue(),
          date: 'createdAt',
          endDate: endDate ? endDate.toISOString() : undefined  // Convertir a string
        };
        this.params.next(newParams);
        this.resetParams();
      })
    );
  }
  resetParams() {
    if(this.paginator) {
      const currentPageSize = this.paginator?.pageSize ?? 10;
      this.params.next({ ...this.params.getValue(), offset: 0, limit: currentPageSize });
      this.paginator.pageIndex = 0;
    }
  }

  fetchReversals(): void {
    this.statisticsService
      .getAllReversals(this.params.getValue())
      .pipe(take(1))
      .subscribe((data) => {
        console.log('REVERSAL', data)
        this.reversals = data.reversals;
        this.totalItems = data.totalItems;
        this.tableData = new MatTableDataSource<MatTableDataSourceInput>(this.reversals);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
