import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StadisticsComponent } from './stadistics.component';
import { DebtsComponent } from './components/debts/debts.component';
import { DebtorsComponent } from './components/debtors/debtors.component';
import { PaymentsComponent } from './components/payments/payments/payments.component';

const routes: Routes = [
  { path: '', redirectTo: 'deudas', pathMatch: 'full' },
  {
    path: '',
    component: StadisticsComponent,
    children: [
      {
        path: 'deudas',
        title: 'Unibrica - Estadísticas | Deudas',
        component: DebtsComponent,
      },
      {
        path: 'deudores',
        title: 'Unibrica - Estadísticas | Deudores',
        component: DebtorsComponent,
      },
      {
        path: 'pagos',
        title: 'Unibrica - Estadísticas | Pagos',
        component: PaymentsComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StadisticsRoutingModule {}
