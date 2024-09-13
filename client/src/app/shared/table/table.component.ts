import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CdkColumnDef } from '@angular/cdk/table';
import { Debt } from 'src/app/stadistics/components/debts/debts.interface';
import { Debtor } from 'src/app/stadistics/components/debtors/debtors.interface';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';
import { Payment } from 'src/app/stadistics/components/payments/payments/payments.component';
import { Reversal } from 'src/app/stadistics/components/reversals/reversals.component';

const MaterialModules = [
  MatTableModule,
]

interface TableClickEvent {
  column:string,
  value: any
}

export const columnNamesMap: { [key: string]: string } = {
  createdAt: 'Creado',
  updatedAt: 'Actualizado',
  dueDate: 'Vencimiento',
  id: 'Id',
  idDebt: 'ID Deuda',
  amount: 'Monto',
  firstNames: 'Nombre',
  lastNames: 'Apellido',
  dni: 'DNI',
  name: 'Nombre',
  clientId: 'ID Cliente',
  recordType: 'Tipo de registro',
  account: 'Cuenta',
  agreementNumber: 'N° de convenio',
  creditCompany: 'Empresa crédito',
  companyAccountNumber: 'N° de abonado',
  debitDate: 'Fecha débito',
  subscriberID: 'N° de abonado',
  bank: 'Banco',
  customerAccountType: "Tipo de cuenta",
  branchCode: 'Sucursal',
  bankAccountNumber: 'N° de cuenta',
  debitSequence: 'Secuencial débito',
  installmentNumber: 'N° cuota',
  debitStatus: 'Estado de débito',
  chargedAmount: 'Monto cobrado',
  debtAmount: 'Monto deuda',
  serviceNumber: 'N° de servicio',
  companyNumber: 'N° de empresa',
  accountType: 'Tipo de cuenta',
  accountNumber: 'N° de cuenta',
  currentID: 'ID actual',
  debitID: 'ID débito',
  movementFunction: 'Función del movimiento',
  rejectionCode: 'Código de rechazo',
  debitAmount: 'Monto débito',
  // fileDate: 'Fecha archivo',
  clientName: 'Cliente',
  'debtor.dni': 'DNI',
  'sheet.date': 'Fecha Archivo',
  'bank.bankId': 'Banco',
  'client.name': 'Cliente'
};

export type MatTableDataSourceInput = Debt | Debtor | Client | Payment | Reversal;
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    ...MaterialModules
  ],
  // providers: [CdkColumnDef],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @Input() dataSource!: MatTableDataSource<MatTableDataSourceInput>;
  @Input() columns:string[] = [];
  @Input() clickableColumns!:Set<string>;
  @Output() elementClickEmitter = new EventEmitter<TableClickEvent>();
  columnNames = columnNamesMap;

  ngOnInit() {}

  elementClick (event: TableClickEvent):void {
    console.log('dataSource: ', this.dataSource.data)
    if (!this.clickableColumns) return;
    if(this.clickableColumns.has(event.column)) {
      this.elementClickEmitter.emit(event)
    }
  }

  getColumnValue(element: any, column: string): any {
    return this.getNestedValue(element, column);
  }

  getNestedValue(element: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc && acc[key], element);
  }

}
