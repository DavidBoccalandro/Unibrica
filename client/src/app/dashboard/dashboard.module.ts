import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartsModule } from '../charts/charts.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { CalendarModule } from '../calendar/calendar.module';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { StadisticsService } from '../stadistics/stadistics.service';
import { LineChartPaymentsClientsComponent } from './components/line-chart-payments-clients/line-chart-payments-clients.component';
import { ChartsSelectorComponent } from './components/charts-selector/charts-selector.component';
import { EfficiencyRecoveryChartComponent } from './components/efficiency-recovery-chart/efficiency-recovery-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LineChartReversalsClientsComponent } from './components/line-chart-reversals-clients/line-chart-reversals-clients.component';

@NgModule({
  declarations: [
    DashboardComponent,
    LineChartPaymentsClientsComponent,
    ChartsSelectorComponent,
    EfficiencyRecoveryChartComponent,
    LineChartReversalsClientsComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ChartsModule,
    CalendarModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    NgxChartsModule
  ],
  providers: [DashboardService, StadisticsService],
})
export class DashboardModule {}
