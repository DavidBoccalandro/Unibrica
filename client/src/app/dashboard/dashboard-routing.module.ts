import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ChartsSelectorComponent } from './components/charts-selector/charts-selector.component';
import { LineChartPaymentsClientsComponent } from './components/line-chart-payments-clients/line-chart-payments-clients.component';
import { EfficiencyRecoveryChartComponent } from './components/efficiency-recovery-chart/efficiency-recovery-chart.component';
import { LineChartReversalsClientsComponent } from './components/line-chart-reversals-clients/line-chart-reversals-clients.component';

const routes: Routes = [
  { path: '', redirectTo: 'chart-selector', pathMatch: 'full' },
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'chart-selector', component: ChartsSelectorComponent },
      { path: 'payments-line-chart', component: LineChartPaymentsClientsComponent },
      { path: 'stacked-chart', component: EfficiencyRecoveryChartComponent },
      { path: 'reversals-line-chart', component: LineChartReversalsClientsComponent },
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
