import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartsModule } from '../charts/charts.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { CalendarModule } from '../calendar/calendar.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ChartsModule,
    CalendarModule,
    MatButtonModule,
  ],
  providers: [DashboardService],
})
export class DashboardModule {}
