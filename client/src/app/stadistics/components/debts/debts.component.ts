import { Component, OnDestroy, ViewChild } from '@angular/core';
import { DEBT_TABLE_DATA_MOCK, Debt } from './debts.interface';
import { BehaviorSubject, Subscription, take, debounceTime } from 'rxjs';
import { Params } from '@angular/router';
import { StadisticsService } from '../../stadistics.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Debtor } from '../debtors/debtors.interface';
import { MatTableDataSourceInput } from 'src/app/shared/table/table.component';
import { FilterService } from 'src/app/core/services/filter.service';

@Component({
  selector: 'app-debts',
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.scss'],
})
export class DebtsComponent implements OnDestroy {
  tableData!: MatTableDataSource<MatTableDataSourceInput>;
  tableColumns: string[] = ['idDebt', 'createdAt', 'updatedAt', 'dueDate', 'amount'];
  clickableColumns = new Set<string>();
  subscriptions: Subscription[] = [];
  debts: Debt[] = [];
  params = new BehaviorSubject<{ limit: number; offset: number; filterBy?: string; filterValue?: string }>({
    limit: 10,
    offset: 0,
  });
  $params = this.params.asObservable()
  totalItems = 0;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private statisticsService: StadisticsService, private filterService: FilterService) {}

  ngOnInit(): void {
    this.subscriptions.push(this.$params.subscribe(() => this.fetchDebts()))
    this.subscriptions.push(this.filterService.searchValue$.pipe(debounceTime(500)).subscribe( searchValue => {
      const newParams = { ...this.params.getValue(), filterBy:'idDebt', filterValue: searchValue };
      this.params.next(newParams);
      this.fetchDebts()
    }))

    if (this.paginator && this.debts.length === 0) {
      this.fetchDebts();
    }
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

  fetchDebts(): void {
    this.statisticsService
      .getAllDebts(this.params.getValue())
      .pipe(take(1))
      .subscribe((data) => {
        this.debts = data.debts;
        this.totalItems = data.totalItems;
        this.tableData = new MatTableDataSource<MatTableDataSourceInput>(this.debts);
        this.clickableColumns = new Set<string>([this.tableColumns[0]]);
      });
  }
}
