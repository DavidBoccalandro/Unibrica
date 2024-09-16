import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesComponent } from './components/files/files.component';
import { RouterModule, Routes } from '@angular/router';
import { StadisticsService } from '../stadistics/stadistics.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { FilesService } from './services/files.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

const routes: Routes = [
  { path: '', redirectTo: 'deudas', pathMatch: 'full' },
  {
    path: '',
    component: FilesComponent,
    children: [
      // {
      //   path: 'deudas',
      //   title: 'Unibrica - Estadísticas | Deudas',
      //   component: DebtsComponent,
      // }
    ],
  },
];

@NgModule({
  declarations: [FilesComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  exports: [RouterModule],
  providers: [StadisticsService, FilesService],
})
export class FilesModule {}
