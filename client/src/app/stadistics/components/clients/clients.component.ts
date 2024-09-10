import { Component, ViewChild } from '@angular/core';
import { Client } from './clients.interfaces';
import { StadisticsService } from '../../stadistics.service';
import { Subscription } from 'rxjs';
import { Params } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Debt } from '../debts/debts.interface';
import { MatTableDataSourceInput } from 'src/app/shared/table/table.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {
  clients!: Client[]
  tableData!: MatTableDataSource<MatTableDataSourceInput>;
  tableColumns: string[] = ['name', 'clientId', 'createdAt', 'updatedAt'];
  clickableColumns = new Set<string>([this.tableColumns[0]]);
  subscriptions: Subscription[] = [];
  params!: Params;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor (private statisticsService: StadisticsService) {
    this.subscriptions.push(
      this.statisticsService.getParams().subscribe(params => {
        this.params = params;
      })
    )

    this.subscriptions.push(
      this.statisticsService.getAllClients().subscribe((clients) => {
        this.clients = clients;
        this.tableData = new MatTableDataSource<MatTableDataSourceInput>(clients);
        this.clickableColumns = new Set<string>([this.tableColumns[0]]);
        this.tableData.paginator = this.paginator;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
