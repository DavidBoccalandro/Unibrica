import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterService } from 'src/app/core/services/filter.service';
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent {
  @Input() currentRoute!: string;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

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
      {value: 'accountNumber', label: 'N de cuenta'},
      {value: 'debitID', label: 'ID débito'},
      {value: 'currentID', label: 'ID actual'},
    ]
  };

  constructor(private filterService: FilterService) {}

  ngOnInit(): void { }

  // changeSearchValue(search: string): void {
  //   this.filterService.updateSearchValue(search);
  // }

  // changeSearchField(field: any): void {
  //   this.filterService.updateSearchField(field.value);
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

  searchButtonClick(): void {
    // You can perform additional logic here if needed
  }
}
