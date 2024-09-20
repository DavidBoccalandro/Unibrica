import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Debt } from '../debts.interface';

export async function generateDebtExcel(
  debts: Debt[],
  filters: { name: string; value: string | number; operator?: string; start?: Date; end?: Date }[]
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Deudas');

  worksheet.addRow([]);

  // Añadir descripción de filtros
  worksheet.addRow(['Descripción de filtros']).font = { bold: true, size: 16 };
  worksheet.addRow(['Filtro', 'Condiciones']).font = { bold: true, size: 14 };
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

    worksheet.addRow(description).font = { size: 13,  };
  });

  // Añadir una fila en blanco para separación
  worksheet.addRow([]);

  const columns = [
    {
      header: 'Sucursal',
      key: 'branchCode',
      width: 20,
    },
    // { header: 'Tipo de cuenta', key: 'accountType', width: 20 },
    {
      header: 'Cuenta',
      key: 'account',
      width: 17,
    },
    {
      header: 'ID Deuda',
      key: 'idDebt',
      width: 15,
    },
    {
      header: 'Vencimiento',
      key: 'dueDate',
      width: 13,
    },
    {
      header: 'Monto',
      key: 'amount',
      width: 12,
    },
    {
      header: 'Cliente',
      key: 'client',
      width: 15,
    },
    {
      header: 'Deudor',
      key: 'debtor',
      width: 38,
    },
  ];

  if (worksheet.columns) {
    worksheet.columns = columns.map((column) => ({
      ...column,
      header: '',
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    }));
  }

  // Añadir datos a la hoja
  debts.forEach((debt) => {
    worksheet.addRow({
      branchCode: debt.branchCode,
      // accountType: debt.accountType,
      account: debt.account,
      idDebt: debt.idDebt,
      dueDate: debt.dueDate,
      amount: debt.amount,
      client: debt.client?.name,
      debtor: ` ${debt.debtor.lastNames} ${debt.debtor.firstNames.trim()}`,
    });
  });

  // Crear una tabla para los datos
  const tableStartRow = filters.length + 5; // Start table after the blank row
  const table = worksheet.addTable({
    name: 'ReversalsTable',
    ref: `A${tableStartRow}`, // Table reference starting row
    columns: columns.map((col) => ({ name: col.header as string })),
    rows: debts.map((debt) => [
      debt.branchCode,
      // accountType: debt.accountType,
      debt.account,
      debt.idDebt,
      debt.dueDate,
      debt.amount,
      debt.client?.name,
      `${debt.debtor.lastNames} ${debt.debtor.firstNames.trim()} `,
    ]),
    style: {
      theme: 'TableStyleMedium7',
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
    saveAs(blob, 'liquidaciones-filtrados.xlsx');
  });
}
