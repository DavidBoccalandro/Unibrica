import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { NavigationEnd, Router, Event } from '@angular/router';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { FilterValues } from './components/filter/filter.interfaces';
import { StadisticsService } from './stadistics.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterModalComponent } from './components/filter-modal/filter-modal.component';

const DEFAULT_PAGE_INFO: PageEvent = {
  pageIndex: 1,
  pageSize: 25,
  length: 1,
};

const DEFAULT_FILTERS: FilterValues = {
  search: '',
  searchField: '',
};

@Component({
  selector: 'app-stadistics',
  templateUrl: './stadistics.component.html',
  styleUrls: ['./stadistics.component.scss'],
})
export class StadisticsComponent implements OnInit, OnDestroy {
  currentRoute!: string;
  routerEvents$!: Subscription;
  tabs = ['deudas', 'pagos', 'reversas'];
  filtersShown = false;
  pageInfo: PageEvent = DEFAULT_PAGE_INFO;
  filters: FilterValues = DEFAULT_FILTERS;

  constructor(
    private router: Router,
    private stadisticsService: StadisticsService,
    public dialog: MatDialog
  ) // private dashboardService: DashboardService
  {}

  ngOnInit(): void {
    this.currentRoute = this.router.url.split('/')[2].split('?')[0];
    this.routerEvents$ = this.router.events
      .pipe(distinctUntilChanged())
      .subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = this.router.url.split('/')[2].split('?')[0];
        }
      });
  }

  ngOnDestroy(): void {
    this.routerEvents$.unsubscribe();
  }

  displayFilters(event: MouseEvent): void {
    const buttonRect = (event.target as HTMLElement).getBoundingClientRect();
    // console.log('button: ', buttonRect
    const config = {
      position: { top: `${79 + 10}px`, left: `${1515 - 225}px` },
      hasBackdrop: true,
      backdropClass: 'transparent-backdrop',
      autoFocus: false, // Evita que enfoque automático cause cambio de tamaño inesperado
      panelClass: 'dynamic-width-modal',
    }
    const dialogRef = this.dialog.open(FilterModalComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  handlePageEvent(pageEvent: PageEvent): void {
    this.pageInfo = pageEvent;
    this.stadisticsService.navigateWithQueryParams(this.pageInfo, this.filters, this.currentRoute);
  }

  handleFilterEvent(filterEvent: FilterValues): void {
    this.filters = filterEvent;
    this.stadisticsService.navigateWithQueryParams(this.pageInfo, this.filters, this.currentRoute);
  }
  openClientModal(client = null): void {
    const dialogRef = this.dialog.open(FilterModalComponent, {
      width: '500px',
      // data: { client },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (client) {
          // Lógica para editar el cliente existente
          console.log('Cliente actualizado', result);
        } else {
          // Lógica para crear un nuevo cliente
          console.log('Nuevo cliente creado', result);
        }
      }
    });
  }
}
