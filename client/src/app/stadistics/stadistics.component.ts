import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { NavigationEnd, Router, Event } from '@angular/router';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FilterModalComponent } from './components/filter-modal/filter-modal.component';

const DEFAULT_PAGE_INFO: PageEvent = {
  pageIndex: 1,
  pageSize: 25,
  length: 1,
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

  constructor(private router: Router, public dialog: MatDialog) {}

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
    const config = {
      position: { top: `${79 + 10}px`, left: `${1515 - 225}px` },
      hasBackdrop: true,
      backdropClass: 'transparent-backdrop',
      autoFocus: false,
      panelClass: 'dynamic-width-modal',
    }
    const dialogRef = this.dialog.open(FilterModalComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
