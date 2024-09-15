import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesComponent } from './components/files/files.component';
import { RouterModule, Routes } from '@angular/router';
import { StadisticsService } from '../stadistics/stadistics.service';
import { MatTableModule } from '@angular/material/table';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';

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
  declarations: [
    FilesComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatTableModule,
    // PaginationComponent,
    MatPaginatorModule,
    MatIconModule,
  ],
  exports: [RouterModule],
  providers: [StadisticsService]
})
export class FilesModule { }
