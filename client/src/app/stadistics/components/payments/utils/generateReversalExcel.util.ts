import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Reversal } from '../../reversals/reversals.component';

export async function generateReversalExcel(
  reversals: Reversal[],
  filters: { name: string; value: string | number; operator?: string, start?: Date, end?: Date }[]
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reversas');

  worksheet.addRow([]);

  // Añadir descripción de filtros
  worksheet.addRow(['Descripción de filtros']).font = { bold: true, size: 16 };
  filters.forEach((filter) => {
    const description = filter.operator
      ? `${filter.name} ${filter.operator} ${filter.value}`
      : filter.start && filter.end
      ? `${filter.name} entre ${filter.start.toLocaleDateString()} y ${filter.end.toLocaleDateString()}`
      : `${filter.name}: ${filter.value}`;
    worksheet.addRow([description]).font = { size: 13 };
  });

  // Añadir una fila en blanco para separación
  worksheet.addRow([]);

  // Definir las columnas del archivo Excel
  const columns = [
    { header: 'Número de convenio', key: 'agreementNumber', width: 15 },
    // { header: 'Número de servicio', key: 'serviceNumber', width: 15 },
    // { header: 'Número de empresa', key: 'companyNumber', width: 15 },
    { header: 'Banco', key: 'bankCode', width: 9 },
    { header: 'Sucursal', key: 'branchCode', width: 9 },
    // { header: 'Tipo de cuenta', key: 'accountType', width: 15 },
    { header: 'Número de cuenta', key: 'accountNumber', width: 20 },
    { header: 'Id usuario', key: 'currentId', width: 25 },
    { header: 'Id del débito', key: 'debitId', width: 20 },
    // { header: 'Código de movimiento', key: 'movementFunction', width: 15 },
    // { header: 'Código de rechazo', key: 'rejectionCode', width: 15 },
    { header: 'Vencimiento', key: 'dueDate', width: 15 },
    { header: 'Importe', key: 'debitAmount', width: 15 },
  ];

  if (worksheet.columns) {
    worksheet.columns = columns.map(column => ({
      ...column,
      header: '',
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    }))
  }

  // Añadir datos a la hoja
  reversals.forEach((reversal) => {
    worksheet.addRow({
      agreementNumber: reversal.agreementNumber,
      // serviceNumber: reversal.serviceNumber,
      // companyNumber: reversal.companyNumber,
      bankCode: reversal.bank?.bankId || 'Desconocido',
      branchCode: reversal.branchCode,
      // accountType: reversal.accountType,
      accountNumber: reversal.accountNumber,
      currentId: reversal.currentId,
      debitId: reversal.debitId,
      // movementFunction: reversal.movementFunction,
      // rejectionCode: reversal.rejectionCode,
      dueDate: reversal.dueDate,
      debitAmount: reversal.debitAmount,
    });
  });

  // Crear una tabla para los datos
  const tableStartRow = filters.length + 4; // Start table after the blank row
  const table = worksheet.addTable({
    name: 'ReversalsTable',
    ref: `A${tableStartRow}`, // Table reference starting row
    columns: columns.map((col) => ({ name: col.header as string })),
    rows: reversals.map((reversal) => [
      reversal.agreementNumber,
      // reversal.serviceNumber,
      // reversal.companyNumber,
      reversal.bank?.bankId || 'Desconocido',
      reversal.branchCode,
      // reversal.accountType,
      reversal.accountNumber,
      reversal.currentId,
      reversal.debitId,
      // reversal.movementFunction,
      // reversal.rejectionCode,
      reversal.dueDate,
      reversal.debitAmount,
    ]),
    style: {
      theme: 'TableStyleMedium6',
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
    saveAs(blob, 'reversales-filtrados.xlsx');
  });
}
