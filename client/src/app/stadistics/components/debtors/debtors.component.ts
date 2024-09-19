import { StadisticsService } from './../../stadistics.service';
import { Component, ViewChild } from '@angular/core';
import { DEBTOR_TABLE_DATA_MOCK, Debtor } from './debtors.interface';
import { BehaviorSubject, Subscription, debounceTime, take } from 'rxjs';
import { Params } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Debt } from '../debts/debts.interface';
import { MatTableDataSourceInput } from 'src/app/shared/table/table.component';
import { FilterService } from 'src/app/core/services/filter.service';

@Component({
  selector: 'app-debtors',
  templateUrl: './debtors.component.html',
  styleUrls: ['./debtors.component.scss']
})
export class DebtorsComponent {
  debtors!: Debtor[]
  tableData!: MatTableDataSource<MatTableDataSourceInput>;
  tableColumns = ['firstNames', 'dni', 'createdAt', 'updatedAt' ];
  clickableColumns = new Set<string>([this.tableColumns[0]]);
  subscriptions: Subscription[] = [];
  params = new BehaviorSubject<{ limit: number; offset: number; filterBy?: string; filterValue?: string }>({
    limit: 10,
    offset: 0,
  });
  $params = this.params.asObservable()
  totalItems = 0;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private statisticsService: StadisticsService, private filterService: FilterService) {}

  ngOnInit(): void {
    this.$params.subscribe(() => this.fetchDebts())

    if (this.paginator && this.debtors?.length === 0) {
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
      .getAllDebtors(this.params.getValue())
      .pipe(take(1))
      .subscribe((data) => {
        this.debtors = data.debtors;
        this.totalItems = data.totalItems;
        this.tableData = new MatTableDataSource<MatTableDataSourceInput>(this.debtors);
        this.clickableColumns = new Set<string>([this.tableColumns[0]]);
      });
  }
}
