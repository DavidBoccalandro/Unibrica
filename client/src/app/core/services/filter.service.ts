import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FilterParams {
  stringFilters?: { filterBy: string; filterValue: string }[];
  numericFilters?: { filterBy: string; operator: string; filterValue: number }[];
  // dates?: { date: string; startDate: Date; endDate: Date }[];
}
@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private searchValueSubject = new BehaviorSubject<string>('');
  searchValue$: Observable<string> = this.searchValueSubject.asObservable();

  private searchFieldSubject = new BehaviorSubject<string>('');
  searchField$: Observable<string> = this.searchFieldSubject.asObservable();

  private rangeStartSubject = new BehaviorSubject<Date | null>(null);
  rangeStart$: Observable<Date | null> = this.rangeStartSubject.asObservable();

  private rangeEndSubject = new BehaviorSubject<Date | null>(null);
  rangeEnd$: Observable<Date | null> = this.rangeEndSubject.asObservable();

  private dateFieldSubject = new BehaviorSubject<String>('');
  dateFieldSubject$: Observable<String> = this.dateFieldSubject.asObservable();

  private filtersSubject = new BehaviorSubject<FilterParams | null >(null);
  filters$: Observable<FilterParams | null> = this.filtersSubject.asObservable();

  constructor() {}

  updateSearchValue(search: string): void {
    this.searchValueSubject.next(search);
  }

  updateSearchField(field: string): void {
    this.searchFieldSubject.next(field);
  }

  updateRangeStart(start: Date | null): void {
    this.rangeStartSubject.next(start);
  }

  updateRangeEnd(end: Date | null): void {
    this.rangeEndSubject.next(end);
  }

  updateDateField(field: string): void {
    this.dateFieldSubject.next(field);
  }

  updateFilters(filtersArray: FilterParams) {
    this.filtersSubject.next(filtersArray);
  }
}
