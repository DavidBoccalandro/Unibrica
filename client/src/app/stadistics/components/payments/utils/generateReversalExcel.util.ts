import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Reversal } from '../../reversals/reversals.component';

export async function generateReversalExcel(reversals: Reversal[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reversales');

  // Definir las columnas del archivo Excel
  worksheet.columns = [
    {
      header: 'Número de convenio',
      key: 'agreementNumber',
      width: 15,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    // {
    //   header: 'Número de servicio',
    //   key: 'serviceNumber',
    //   width: 15,
    //   style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    // },
    // {
    //   header: 'Número de empresa',
    //   key: 'companyNumber',
    //   width: 15,
    //   style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    // },
    {
      header: 'Banco',
      key: 'bankCode',
      width: 9,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Sucursal',
      key: 'branchCode',
      width: 9,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    // {
    //   header: 'Tipo de cuenta',
    //   key: 'accountType',
    //   width: 15,
    //   style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    // },
    {
      header: 'Número de cuenta',
      key: 'accountNumber',
      width: 20,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Id usuario',
      key: 'currentId',
      width: 25,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Id del débito',
      key: 'debitId',
      width: 20,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    // {
    //   header: 'Código de movimiento',
    //   key: 'movementFunction',
    //   width: 15,
    //   style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    // },
    // {
    //   header: 'Código de rechazo',
    //   key: 'rejectionCode',
    //   width: 15,
    //   style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    // },
    {
      header: 'Vencimiento',
      key: 'dueDate',
      width: 15,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Importe a debitar',
      key: 'debitAmount',
      width: 15,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
  ];

  // Añadir datos
  reversals.forEach((reversal) => {
    worksheet.addRow({
      agreementNumber: reversal.agreementNumber,
      serviceNumber: reversal.serviceNumber,
      companyNumber: reversal.companyNumber,
      bankCode: reversal.bank?.bankId || 'Desconocido',
      branchCode: reversal.branchCode,
      accountType: reversal.accountType,
      accountNumber: reversal.accountNumber,
      currentId: reversal.currentId,
      debitId: reversal.debitId,
      movementFunction: reversal.movementFunction,
      rejectionCode: reversal.rejectionCode,
      dueDate: reversal.dueDate,
      debitAmount: reversal.debitAmount,
    });
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
