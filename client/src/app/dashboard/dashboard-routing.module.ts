import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ChartsSelectorComponent } from './components/charts-selector/charts-selector.component';
import { LineChartComponent } from '@swimlane/ngx-charts';
import { LineChartPaymentsClientsComponent } from './components/line-chart-payments-clients/line-chart-payments-clients.component';

const routes: Routes = [
  { path: '', redirectTo: 'chart-selector', pathMatch: 'full' },
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'chart-selector', component: ChartsSelectorComponent },
      { path: 'line-chart', component: LineChartPaymentsClientsComponent },
      // { path: 'grafico2', component: LineChartComponent, outlet: 'grafico' },
      // { path: 'grafico3', component: LineChartComponent, outlet: 'grafico' },
      // { path: 'grafico4', component: LineChartComponent, outlet: 'grafico' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
