import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { FilterService } from 'src/app/core/services/filter.service';
import { columnNamesMap } from 'src/app/shared/table/table.component';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
})
export class FilterModalComponent {
  @Input() currentRoute!: string;
  selectedFilter: { value: string; label: string; type: string } = {
    value: '',
    label: '',
    type: '',
  };

  selectOptions: { [key: string]: { value: string; label: string; type: string }[] } = {
    deudas: [{ value: 'idDebt', label: 'ID Deuda', type: 'numeric' }],
    deudores: [
      { value: 'firstNames', label: 'Nombre', type: 'string' },
      { value: 'dni', label: 'DNI', type: 'string' },
    ],
    clientes: [
      { value: 'name', label: 'Nombre', type: 'string' },
      { value: 'idClient', label: 'ID Cliente', type: 'string' },
    ],
    pagos: [
      { value: 'companyAccountNumber', label: 'N° de abonado', type: 'string' },
      { value: 'bankAccountNumber', label: 'N° de cuenta', type: 'string' },
      { value: 'debitStatus', label: 'Estado de débito', type: 'string' },
      { value: 'agreementNumber', label: 'N° de convenio', type: 'numeric' },
      { value: 'branchCode', label: 'Sucursal', type: 'numeric' },
      { value: 'chargedAmount', label: 'Monto cobrado', type: 'numeric' },
      { value: 'debtAmount', label: 'Monto deuda', type: 'numeric' },
      { value: 'debitDate', label: 'Fecha débito', type: 'date' },
      { value: 'fileDate', label: 'Fecha archivo', type: 'date' },
    ],
    reversas: [
      { value: 'accountNumber', label: 'N de cuenta', type: 'string' },
      { value: 'debitID', label: 'ID débito', type: 'numeric' },
      { value: 'currentID', label: 'ID actual', type: 'numeric' },
    ],
  };

  filtersForm: FormGroup;

  constructor(
    private filterService: FilterService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filtersForm = this.fb.group({
      filters: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.resetFilters();
    });
  }

  get filters(): FormArray {
    return this.filtersForm.get('filters') as FormArray;
  }

  get filtersControl(): FormGroup[] {
    const formArray = this.filtersForm.get('filters') as FormArray;
    return formArray.controls as FormGroup[];
  }

  addFilter() {
    const filterType = this.selectedFilter.type;
    let filterGroup: FormGroup;

    if (filterType === 'string') {
      filterGroup = this.fb.group({
        name: [this.selectedFilter.label],
        value: ['', Validators.required],
      });
    } else if (filterType === 'numeric') {
      filterGroup = this.fb.group({
        name: [this.selectedFilter.label],
        value: ['', Validators.required],
        operator: ['>=', Validators.required],
      });
    } else {
      filterGroup = this.fb.group({
        name: [this.selectedFilter.label, Validators.required],
        start: ['', Validators.required],
        end: ['', Validators.required],
      });
    }

    this.filters.push(filterGroup);
  }

  changeSearchField(field: any): void {
    console.log('filter name:', field);
    this.selectedFilter = this.selectOptions[this.currentRoute].find(
      (option) => option.label === field.value
    )!;
    console.log('Filtro seleccionado: ', this.selectedFilter);
    this.filterService.updateSearchField(field.value);
  }

  removeFilter(index: number): void {
    this.filters.removeAt(index);
  }

  resetFilters(): void {
    while (this.filters.length !== 0) {
      this.filters.removeAt(0);
    }
    this.selectedFilter = { value: '', label: '', type: '' };
    this.filterService.updateFilters(null);
  }

  filtrar(): void {
    if (this.filters.length > 0) {
      const stringFilterData = this.filters.value
        .filter((filter: { name: string; value: any }) => {
          const filterType = this.selectOptions[this.currentRoute].find(
            (option) => option.label === filter.name
          )?.type;
          return filterType === 'string';
        })
        .map((filter: { name: string; value: any }) => ({
          filterBy: this.mapFilterNameToColumn(filter.name),
          filterValue: filter.value,
        }));

      const numericFilterData = this.filters.value
        .filter((filter: { name: string; value: any; operator?: string }) => {
          const filterType = this.selectOptions[this.currentRoute].find(
            (option) => option.label === filter.name
          )?.type;
          return filterType === 'numeric';
        })
        .map((filter: { name: string; value: any; operator?: string }) => {
          return {
            filterBy: this.mapFilterNameToColumn(filter.name),
            operator: filter.operator,
            filterValue: filter.value,
          };
        });

        const dateFilterData = this.filters.value
        .filter((filter: { name: string; start: Date; end: Date }) => {
          const filterType = this.selectOptions[this.currentRoute].find(
            (option) => option.label === filter.name
          )?.type;
          return filterType === 'date';
        })
        .map((filter: { name: string; start: Date; end: Date }) => {
          return {
            filterBy: this.mapFilterNameToColumn(filter.name),
            startDate: filter.start,
            endDate: filter.end,
          };
        });


      // console.log('Filtros final: ', {
      //   stringFilters: stringFilterData,
      //   numericFilters: numericFilterData,
      //   dateFilters: dateFilterData
      // });
      this.filterService.updateFilters({
        stringFilters: stringFilterData,
        numericFilters: numericFilterData,
        dateFilters: dateFilterData,
      });
    }
  }

  mapFilterNameToColumn(filterName: string): string {
    const entry = Object.entries(columnNamesMap).find(([key, value]) => value === filterName);
    return entry ? entry[0] : '';
  }

  filterType(filter: FormGroup): string {
    // console.log('FIlter: ', filter)
    const filterType = this.selectOptions[this.currentRoute].find(
      (option) => option.label === filter.get('name')?.value
    )?.type;
    // console.log('filterType:', filterType)
    return filterType!;
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
