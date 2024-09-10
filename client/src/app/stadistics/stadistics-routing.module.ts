import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StadisticsComponent } from './stadistics.component';
import { DebtsComponent } from './components/debts/debts.component';
import { PaymentsComponent } from './components/payments/payments/payments.component';
import { ReversalsComponent } from './components/reversals/reversals.component';

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
        path: 'pagos',
        title: 'Unibrica - Estadísticas | Pagos',
        component: PaymentsComponent,
      },
      {
        path: 'reversas',
        title: 'Unibrica - Estadísticas | Reversas',
        component: ReversalsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StadisticsRoutingModule {}
