import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
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

  constructor() { }

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
}
