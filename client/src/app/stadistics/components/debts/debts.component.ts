import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Debt } from './debts.interface';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { StadisticsService, StatisticsParams } from '../../stadistics.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableDataSourceInput } from 'src/app/shared/table/table.component';
import { FilterService } from 'src/app/core/services/filter.service';
import { generateDebtExcel } from './utils/generateDebtExcel.util';

@Component({
  selector: 'app-debts',
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.scss'],
})
export class DebtsComponent implements OnDestroy {
  tableData!: MatTableDataSource<MatTableDataSourceInput>;
  tableColumns: string[] = ['account', 'debtor.dni', 'idDebt', 'sheet.date', 'client.name', 'dueDate', 'branchCode', 'amount'];
  clickableColumns = new Set<string>();
  subscriptions: Subscription[] = [];
  debts: Debt[] = [];
  params = new BehaviorSubject<StatisticsParams>({
    limit: 10,
    offset: 0,
  });
  $params = this.params.asObservable()
  totalItems = 0;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private statisticsService: StadisticsService, private filterService: FilterService) {}

  ngOnInit(): void {
    this.$params.subscribe(() => this.fetchDebts());

    this.subscriptions.push(
      this.filterService.filters$.subscribe((value) => {
        if(!value) {
          this.resetParams()
        } else {
          const newParams = {...this.params.getValue(), ...value}
          this.params.next(newParams);
        }
      })
    )

    this.subscriptions.push(
      this.filterService.filterDescriptions$.subscribe((data) => {
        if(data !== null) {
          this.generateExcel(data);
        }
      })
    );
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
        // console.log('Debts: ', data)
        this.debts = data.debts;
        this.totalItems = data.totalItems;
        this.tableData = new MatTableDataSource<MatTableDataSourceInput>(this.debts);
        this.clickableColumns = new Set<string>([this.tableColumns[0]]);
      });
  }

  generateExcel(filters: {name: string, value: string | number, operator?: string}[]) {
    this.statisticsService
      .getAllDebtsWithoutPagination(this.params.getValue())
      .pipe(take(1))
      .subscribe((data) => {
        const allDebts = data.debts;
        generateDebtExcel(allDebts, filters);
      });

    this.filterService.resetExportToExcel();
  }

  resetParams() {
    if(this.paginator) {
      const currentPageSize = this.paginator?.pageSize ?? 10;
      this.params.next({offset: 0, limit: currentPageSize });
      this.paginator.pageIndex = 0;
    }
  }
}
