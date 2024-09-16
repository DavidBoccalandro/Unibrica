import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, BehaviorSubject, take } from 'rxjs';
import { FilterService } from 'src/app/core/services/filter.service';
import { columnNamesMap, MatTableDataSourceInput } from 'src/app/shared/table/table.component';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';
import { Debt } from 'src/app/stadistics/components/debts/debts.interface';
import { Payment } from 'src/app/stadistics/components/payments/payments/payments.component';
import { Reversal } from 'src/app/stadistics/components/reversals/reversals.component';
import { StatisticsParams2, StadisticsService } from 'src/app/stadistics/stadistics.service';
import { FilesService } from '../../services/files.service';

export interface File {
  date: Date;
  fileName: string;
  debts?: Debt[];
  payments?: Payment[];
  reversals?: Reversal[];
  client?: Client;
}

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
})
export class FilesComponent {
  files!: File[];
  tableData!: MatTableDataSource<MatTableDataSourceInput>;
  tableColumns: string[] = [
    'date',
    'fileName',
    // 'debts',
    // 'payments',
    // 'reversals',
    // 'clients'
  ];
  tableColumnsAll: string[] = [...this.tableColumns, 'download'];
  clickableColumns = new Set<string>([]);
  subscriptions: Subscription[] = [];
  params = new BehaviorSubject<StatisticsParams2>({
    limit: 10,
    offset: 0,
  });
  $params = this.params.asObservable();
  totalItems = 0;

  dataSource!: MatTableDataSource<MatTableDataSourceInput>;
  columnNames = columnNamesMap;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private statisticsService: StadisticsService,
    private filterService: FilterService,
    private filesService: FilesService
  ) {
    this.$params.subscribe(() => this.fetchSheets());

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
  }

  resetParams() {
    if (this.paginator) {
      const currentPageSize = this.paginator?.pageSize ?? 10;
      this.params.next({ offset: 0, limit: 10 });
      this.paginator.pageIndex = 0;
    }
  }

  fetchSheets(): void {
    this.statisticsService
      .getAllSheets(this.params.getValue())
      .pipe(take(1))
      .subscribe((data) => {
        console.log('Sheets: ', data);
        this.files = data.sheets;
        this.totalItems = data.totalItems;
        this.tableData = new MatTableDataSource<MatTableDataSourceInput>(this.files);
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

  download(element: any) {
    let name = element.fileName
    if(name.match(/\.[^/.]+$/)) {
      name = name.replace(/\.[^/.]+$/, "");
    }
    this.filesService.downloadSheet(name).subscribe(
      (data: Blob) => {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); // Limpia la URL del blob
      },
      (error) => {
        console.error('Error al descargar el archivo', error);
      }
    );
  }

  elementClick(event: any): void {
    console.log('dataSource: ', this.dataSource.data);
    // if (!this.clickableColumns) return;
    // if(this.clickableColumns.has(event.column)) {
    //   this.elementClickEmitter.emit(event)
    // }
  }

  getColumnValue(element: any, column: string): any {
    return this.getNestedValue(element, column);
  }

  getNestedValue(element: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc && acc[key], element);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
