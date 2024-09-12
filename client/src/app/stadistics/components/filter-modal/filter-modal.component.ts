import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { FilterService } from 'src/app/core/services/filter.service';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss']
})
export class FilterModalComponent {
  @Input() currentRoute!: string;
  selectedFilter = '';

  selectOptions: { [key: string]: { value: string; label: string }[] } = {
    deudas: [{ value: 'idDebt', label: 'ID Deuda' }],
    deudores: [
      { value: 'firstNames', label: 'Nombre' },
      { value: 'dni', label: 'DNI' },
    ],
    clientes: [
      { value: 'name', label: 'Nombre' },
      { value: 'idClient', label: 'ID Cliente' },
    ],
    pagos: [
      { value: 'companyAccountNumber', label: 'N de abonado' },
      { value: 'bankAccountNumber', label: 'N° cuenta bancaria' },
    ],
    reversas: [
      { value: 'accountNumber', label: 'N de cuenta' },
      { value: 'debitID', label: 'ID débito' },
      { value: 'currentID', label: 'ID actual' },
    ],
  };

  filtersForm: FormGroup;

  constructor(private filterService: FilterService, private fb: FormBuilder, private router: Router) {
    this.filtersForm = this.fb.group({
      filters: this.fb.array([]),
    });
  }

  ngOnInit(): void {    this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe(() => {
      this.resetFilters(); // Reinicia los filtros cuando cambia la ruta
    }); }

  get filters(): FormArray {
    return this.filtersForm.get('filters') as FormArray;
  }

  get filtersControl(): FormGroup[] {
    const formArray = this.filtersForm.get('filters') as FormArray;
    return formArray.controls as FormGroup[]
  }

  addFilter() {
    const filter = this.fb.group({
      name: [this.selectedFilter],
      value: ['', Validators.required]
    })

    this.filters.push(filter)
  }

  changeSearchField(field: any): void {
    this.selectedFilter = field.value;
    this.filterService.updateSearchField(field.value);
  }

  removeFilter(index: number): void {
    this.filters.removeAt(index)
  }

  resetFilters(): void {
    while (this.filters.length !== 0) {
      this.filters.removeAt(0);
    }
    this.selectedFilter = ''; // Reinicia el filtro seleccionado
  }

  // changeSearchValue(search: string): void {
  //   this.filterService.updateSearchValue(search);
  // }

  // changeRangeStart(start: Date | null): void {
  //   this.filterService.updateRangeStart(start);
  // }

  // changeRangeEnd(end: Date | null): void {
  //   this.filterService.updateRangeEnd(end);
  // }

  // clearSearchValue(): void {
  //   this.filterService.updateSearchValue('');
  // }

  // searchButtonClick(): void {
  //   // You can perform additional logic here if needed
  // }
}
