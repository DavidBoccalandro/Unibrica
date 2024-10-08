import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FilterParams {
  stringFilters?: { filterBy: string; filterValue: string }[];
  numericFilters?: { filterBy: string; operator: string; filterValue: number }[];
  dateFilters?: { filterBy: string; startDate: Date; endDate: Date }[];
}
@Injectable({
  providedIn: 'root',
})
export class FilterService {
  // private searchValueSubject = new BehaviorSubject<string>('');
  // searchValue$: Observable<string> = this.searchValueSubject.asObservable();

  private searchFieldSubject = new BehaviorSubject<string>('');
  searchField$: Observable<string> = this.searchFieldSubject.asObservable();

  // private rangeStartSubject = new BehaviorSubject<Date | null>(null);
  // rangeStart$: Observable<Date | null> = this.rangeStartSubject.asObservable();

  // private rangeEndSubject = new BehaviorSubject<Date | null>(null);
  // rangeEnd$: Observable<Date | null> = this.rangeEndSubject.asObservable();

  // private dateFieldSubject = new BehaviorSubject<String>('');
  // dateFieldSubject$: Observable<String> = this.dateFieldSubject.asObservable();

  private filtersSubject = new BehaviorSubject<FilterParams | null >(null);
  filters$: Observable<FilterParams | null> = this.filtersSubject.asObservable();

  private filterFormSubject = new BehaviorSubject<any>('');
  filterForm$: Observable<any> = this.filterFormSubject.asObservable();

  constructor() {}

  updateSearchField(field: string): void {
    this.searchFieldSubject.next(field);
  }

  updateFilters(filtersArray: FilterParams | null) {
    this.filtersSubject.next(filtersArray);
  }

  updateFilterForm(filterForm: FormArray<any>) {
    this.filterFormSubject.next(filterForm)
  }
}
