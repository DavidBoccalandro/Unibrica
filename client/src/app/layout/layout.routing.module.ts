import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { FilesModule } from '../files/files.module';
import { FilesComponent } from '../files/components/files/files.component';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        title: 'Unibrica - Dashboard',
        loadChildren: () =>
        import('../dashboard/dashboard.module').then(
          m => m.DashboardModule
        )
      },
      {
        path: 'estadisticas',
        title: 'Unibrica - Estadísticas',
        loadChildren: () =>
        import('../stadistics/stadistics.module').then(
          m => m.StadisticsModule
        )
      },
      {
        path: 'archivos',
        title: 'Unibrica - Archivos',
        loadChildren: () =>
        import('../files/files.module').then(
          m => m.FilesModule
        )
      },
      {
        path: 'recursos-humanos',
        title: 'Unibrica - RRHH',
        loadChildren: () =>
        import('../human-resources/human-resources.module').then(
          m => m.HumanResourcesModule
        )
      },
      {
        path: 'perfil',
        title: 'Unibrica - Perfil',
        loadChildren: () =>
        import('../profile/profile.module').then(
          m=> m.ProfileModule
        )
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(LAYOUT_ROUTES)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
