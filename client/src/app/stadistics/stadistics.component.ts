import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { NavigationEnd, Router, Event } from '@angular/router';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { FilterValues } from './components/filter/filter.interfaces';
import { StadisticsService } from './stadistics.service';


const DEFAULT_PAGE_INFO:PageEvent = {
  pageIndex:1,
  pageSize:25,
  length:1
}

const DEFAULT_FILTERS:FilterValues = {
  search: '',
  searchField: ''
}

@Component({
  selector: 'app-stadistics',
  templateUrl: './stadistics.component.html',
  styleUrls: ['./stadistics.component.scss'],
})
export class StadisticsComponent implements OnInit, OnDestroy {
  currentRoute!: string;
  routerEvents$!: Subscription;
  tabs = ['deudas','pagos','reversas'];
  filtersShown = false;
  pageInfo: PageEvent = DEFAULT_PAGE_INFO;
  filters: FilterValues = DEFAULT_FILTERS;

  constructor(private router: Router, private stadisticsService: StadisticsService) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url.split('/')[2].split('?')[0];
    this.routerEvents$ = this.router.events.pipe(distinctUntilChanged()).subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url.split('/')[2].split('?')[0];
      }
    });
  }

  ngOnDestroy(): void {
    this.routerEvents$.unsubscribe();
  }

  displayFilters(): void {
    this.filtersShown = !this.filtersShown;
  }

  handlePageEvent(pageEvent: PageEvent):void {
    this.pageInfo = pageEvent;
    this.stadisticsService.navigateWithQueryParams(this.pageInfo, this.filters, this.currentRoute);
  }

  handleFilterEvent (filterEvent: FilterValues):void {
    this.filters = filterEvent;
    this.stadisticsService.navigateWithQueryParams(this.pageInfo, this.filters, this.currentRoute);
  }
}
