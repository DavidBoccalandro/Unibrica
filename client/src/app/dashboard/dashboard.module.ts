import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartsModule } from '../charts/charts.module';
import { UploadFileModalComponent } from '../shared/modal/upload-file-modal.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { CalendarModule } from '../calendar/calendar.module';
import { MatButtonModule } from '@angular/material/button';
import { ClientModalComponent } from '../shared/modal/clients/client-modal/client-modal.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    UploadFileModalComponent,
    ClientModalComponent,
    ChartsModule,
    CalendarModule,
    MatButtonModule,
  ],
  providers: [DashboardService],
})
export class DashboardModule {}
