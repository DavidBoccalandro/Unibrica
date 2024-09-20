import { Component, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { FilterService } from 'src/app/core/services/filter.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
})
export class FilterModalComponent implements OnDestroy {
  @Input() currentRoute!: string;
  selectedFilter: { value: string; label: string; type: string } = {
    value: '',
    label: '',
    type: '',
  };

  selectOptions: { [key: string]: { value: string; label: string; type: string }[] } = {
    deudas: [
      { value: 'idDebt', label: 'ID Deuda', type: 'string' },
      { value: 'account', label: 'Cuenta', type: 'string' },
      { value: 'clientName', label: 'Cliente', type: 'string' },
      { value: 'dni', label: 'DNI', type: 'string' },
      { value: 'lastNames', label: 'Apellido', type: 'string' },
      { value: 'branchCode', label: 'Sucursal', type: 'numeric' },
      { value: 'dueDate', label: 'Vencimiento', type: 'date' },
      { value: 'fileDate', label: 'Fecha archivo', type: 'date' },
      { value: 'amount', label: 'Monto', type: 'numeric' },
    ],
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
      { value: 'clientName', label: 'Cliente', type: 'string' },
      { value: 'rejectCode', label: 'Código de rechazo', type: 'string' },
      { value: 'agreementNumber', label: 'N° de convenio', type: 'numeric' },
      { value: 'branchCode', label: 'Sucursal', type: 'numeric' },
      { value: 'chargedAmount', label: 'Monto cobrado', type: 'numeric' },
      { value: 'debtAmount', label: 'Monto deuda', type: 'numeric' },
      { value: 'remainingDebt', label: 'Monto remanente', type: 'numeric' },
      { value: 'debitDate', label: 'Fecha débito', type: 'date' },
      { value: 'fileDate', label: 'Fecha archivo', type: 'date' },
    ],
    reversas: [
      { value: 'accountNumber', label: 'N° de cuenta', type: 'string' },
      { value: 'debitId', label: 'ID débito', type: 'string' },
      { value: 'currentId', label: 'ID actual', type: 'string' },
      { value: 'branchCode', label: 'Sucursal', type: 'numeric' },
      { value: 'debitAmount', label: 'Monto cobrado', type: 'numeric' },
      { value: 'dueDate', label: 'Vencimiento', type: 'date' },
      { value: 'fileDate', label: 'Fecha archivo', type: 'date' },
      { value: 'clientName', label: 'Cliente', type: 'string' },
    ],
  };

  filtersForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FilterModalComponent>,
    private filterService: FilterService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // this.currentRoute = data.currentRoute;
    this.filtersForm = this.fb.group({
      filters: this.fb.array([]),
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    event.preventDefault();
    this.filtrar();
  }

  ngOnDestroy(): void {
    this.filterService.updateFilterForm(this.filters);
  }

  ngOnInit(): void {
    this.currentRoute = this.router.url.split('/')[2].split('?')[0];
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.resetFilters();
    });
    this.filterService.filterForm$.pipe(take(1)).subscribe((filters) => {
      if (filters.controls?.length > 0) {
        this.setFiltersToForm(filters);
      }
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
    // this.filterService.updateFilterForm(this.filters)
  }

  setFiltersToForm(filters: FormArray) {
    const filtersArray = this.filtersForm.get('filters') as FormArray;

    if (filters) {
      filtersArray.clear();
      filters.controls.forEach((filter) => {
        this.filters.push(filter);
      });
    }
  }

  changeSearchField(field: any): void {
    this.selectedFilter = this.selectOptions[this.currentRoute].find(
      (option) => option.label === field.value
    )!;
    this.filterService.updateSearchField(field.value);
  }

  removeFilter(index: number): void {
    this.filters.removeAt(index);
  }

  resetFilters(): void {
    // while (this.filters.length !== 0) {
    //   this.filters.removeAt(0);
    // }
    this.filters.clear();
    this.selectedFilter = { value: '', label: '', type: '' };
    this.filterService.updateFilters(null);
    this.filterService.updateFilterForm(this.fb.array([]));
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
          filterBy: this.getFilterValueFromLabel(filter.name),
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
            filterBy: this.getFilterValueFromLabel(filter.name),
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
            filterBy: this.getFilterValueFromLabel(filter.name),
            startDate: filter.start,
            endDate: filter.end,
          };
        });

      this.filterService.updateFilters({
        stringFilters: stringFilterData,
        numericFilters: numericFilterData,
        dateFilters: dateFilterData,
      });
    }
  }

  getFilterValueFromLabel(label: string): string {
    const selectedOption = this.selectOptions[this.currentRoute].find(
      (option) => option.label === label
    );
    return selectedOption ? selectedOption.value : '';
  }

  filterType(filter: FormGroup): string {
    const filterType = this.selectOptions[this.currentRoute].find(
      (option) => option.label === filter.get('name')?.value
    )?.type;
    return filterType!;
  }

  exportToExcel() {
    this.filterService.exportToExcel(this.filtersForm.value.filters);
  }

  close(): void {
    this.dialogRef.close();
  }
}
