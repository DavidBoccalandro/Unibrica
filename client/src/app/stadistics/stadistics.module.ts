import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StadisticsRoutingModule } from './stadistics-routing.module';
import { StadisticsComponent } from './stadistics.component';
import { DebtorsComponent } from './components/debtors/debtors.component';
import { DebtsComponent } from './components/debts/debts.component';
import { ClientsComponent } from './components/clients/clients.component';
import { FilterComponent } from './components/filter/filter.component';

import { TableComponent } from '../shared/table/table.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { SearchBarComponent } from '../shared/search-bar/search-bar.component';

import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { StadisticsService } from './stadistics.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaymentsComponent } from './components/payments/payments/payments.component';
import { ReversalsComponent } from './components/reversals/reversals.component';

const MaterialModules = [
  MatTabsModule,
  MatIconModule,
  MatFormFieldModule,
  MatSelectModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatButtonModule,
  MatPaginatorModule,
];

@NgModule({
  declarations: [
    StadisticsComponent,
    DebtsComponent,
    DebtorsComponent,
    ClientsComponent,
    FilterComponent,
    PaymentsComponent,
    ReversalsComponent,
  ],
  imports: [
    TableComponent,
    CommonModule,
    StadisticsRoutingModule,
    PaginationComponent,
    SearchBarComponent,
    ReactiveFormsModule,
    FormsModule,
    ...MaterialModules,
  ],
  providers: [
    StadisticsService
  ]
})
export class StadisticsModule {}
