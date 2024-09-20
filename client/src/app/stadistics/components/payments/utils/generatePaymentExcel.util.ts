import * as ExcelJS from 'exceljs';
import { Payment } from '../payments/payments.component';
import { saveAs } from 'file-saver';
import { FilterInExcel } from 'src/app/shared/interfaces/filterInExcel.interface';

// Método para generar el archivo Excel
export async function generatePaymentExcel(payments: Payment[], filters: FilterInExcel[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pagos');

  // Añadir una fila en blanco para separación
  worksheet.addRow([]);

  // Añadir descripción de filtros
  worksheet.addRow(['Descripción de filtros']).font = { bold: true, size: 16 };
  const rowSubtitle = worksheet.addRow(['Filtro', 'Condiciones'])
  rowSubtitle.font = { bold: true, size: 14 };
  rowSubtitle.alignment = { horizontal: 'center' };

  filters.forEach((filter) => {
    let description: string[];

    if (filter.operator) {
      description = [`${filter.name}`, `${filter.operator}`, `${filter.value}`];
    } else if (filter.start && filter.end) {
      description = [
        `${filter.name}`,
        `entre ${filter.start.toLocaleDateString()}`,
        `y ${filter.end.toLocaleDateString()}`,
      ];
    } else {
      description = [`${filter.name}`, `contiene '${filter.value}'`];
    }

    const row = worksheet.addRow(description);
    row.font = { size: 13 };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(3).alignment = { horizontal: 'center' };
  });

  // Añadir una fila en blanco para separación
  worksheet.addRow([]);

  // Definir las columnas del archivo Excel
  const columns = [
    {
      header: 'Número de convenio',
      key: 'agreementNumber',
      width: 20,
    },
    {
      header: 'Número de cuenta de la empresa',
      key: 'companyAccountNumber',
      width: 24,
    },
    {
      header: 'Fecha de débito',
      key: 'debitDate',
      width: 15,
    },
    {
      header: 'Banco',
      key: 'bankCode',
      width: 9,
    },
    {
      header: 'Sucursal',
      key: 'branchCode',
      width: 9,
    },
    {
      header: 'Número de cuenta',
      key: 'bankAccountNumber',
      width: 20,
    },
    {
      header: 'Secuencial débito',
      key: 'debitSequence',
      width: 9,
    },
    {
      header: 'Número de cuota',
      key: 'installmentNumber',
      width: 9,
    },
    {
      header: 'Estado del débito',
      key: 'debitStatus',
      width: 9,
    },
    {
      header: 'Importe de movimiento',
      key: 'debtAmount',
      width: 15,
    },
    {
      header: 'Monto debitado',
      key: 'chargedAmount',
      width: 15,
    },
    {
      header: 'Deuda restante',
      key: 'remainingDebt',
      width: 15,
    },
    {
      header: 'Código de rechazo',
      key: 'rejectCode',
      width: 9,
    },
    {
      header: 'Descripción del rechazo',
      key: 'rejectText',
      width: 30,
    },
  ];

  worksheet.columns = columns.map((column) => ({
    ...column,
    header: '',
    style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
  }));

  // Añadir datos
  payments.forEach((payment) => {
    worksheet.addRow({
      agreementNumber: payment.agreementNumber,
      companyAccountNumber: payment.companyAccountNumber,
      debitDate: payment.debitDate,
      bankCode: payment.bank?.bankId || '',
      branchCode: payment.branchCode,
      bankAccountNumber: payment.bankAccountNumber,
      debitSequence: payment.debitSequence,
      installmentNumber: payment.installmentNumber,
      debitStatus: payment.debitStatus,
      debtAmount: payment.debtAmount,
      chargedAmount: payment.chargedAmount,
      remainingDebt: payment.remainingDebt,
      rejectCode: payment.rejectCode,
      rejectText: payment.rejectText,
    });
  });

  // Crear una tabla para los datos
  const tableStartRow = filters.length + 5; // Posición de inicio de la tabla
  const table = worksheet.addTable({
    name: 'PaymentsTable',
    ref: `A${tableStartRow}`, // Referencia de inicio de la tabla
    columns: columns.map((col) => ({ name: col.header as string })),
    rows: payments.map((payment) => [
      payment.agreementNumber,
      payment.companyAccountNumber,
      payment.debitDate,
      payment.bank?.bankId || '',
      payment.branchCode,
      payment.bankAccountNumber,
      payment.debitSequence,
      payment.installmentNumber,
      payment.debitStatus,
      payment.debtAmount,
      payment.chargedAmount,
      payment.remainingDebt,
      payment.rejectCode,
      payment.rejectText,
    ]),
    style: {
      theme: 'TableStyleMedium5',
      showFirstColumn: false,
      showLastColumn: false,
      showRowStripes: true,
      showColumnStripes: false,
    },
  });

  // Estilizar encabezados
  worksheet.getRow(1).font = { bold: true };

  // Generar el archivo Excel en formato blob
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'pagos-filtrados.xlsx');
  });
}
