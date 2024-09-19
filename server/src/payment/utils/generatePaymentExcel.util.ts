import * as ExcelJS from 'exceljs';
import { PaymentRecord } from '../entities/payment.entity';
import path from 'path';

// Método para generar el archivo Excel
export async function generatePaymentExcel(payments: PaymentRecord[], fileName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pagos');

  // Definir las columnas del archivo Excel
  worksheet.columns = [
    // {
    //   header: 'Tipo de registro',
    //   key: 'recordType',
    //   width: 15,
    //   style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    // },
    {
      header: 'Número de convenio',
      key: 'agreementNumber',
      width: 12,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    // {
    //   header: 'Empresa de crédito',
    //   key: 'creditCompany',
    //   width: 15,
    //   style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    // },
    {
      header: 'Número de cuenta de la empresa',
      key: 'companyAccountNumber',
      width: 24,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Fecha de débito',
      key: 'debitDate',
      width: 15,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Banco',
      key: 'bankCode',
      width: 9,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    // {
    //   header: 'Tipo de cuenta del cliente',
    //   key: 'customerAccountType',
    //   width: 15,
    //   style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    // },
    {
      header: 'Sucursal',
      key: 'branchCode',
      width: 9,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Número de cuenta',
      key: 'bankAccountNumber',
      width: 20,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Secuencia de débito',
      key: 'debitSequence',
      width: 9,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Número de cuota',
      key: 'installmentNumber',
      width: 9,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Estado del débito',
      key: 'debitStatus',
      width: 9,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Importe de movimiento',
      key: 'debtAmount',
      width: 15,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Monto debitado',
      key: 'chargedAmount',
      width: 15,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Deuda restante',
      key: 'remainingDebt',
      width: 15,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Código de rechazo',
      key: 'rejectCode',
      width: 9,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
    {
      header: 'Descripción del rechazo',
      key: 'rejectText',
      width: 30,
      style: { alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } },
    },
  ];

  // Rellenar filas con los datos de pagos
  for (const payment of payments) {
    worksheet.addRow({
      recordType: payment.recordType,
      agreementNumber: payment.agreementNumber,
      creditCompany: payment.creditCompany,
      companyAccountNumber: payment.companyAccountNumber,
      debitDate: payment.debitDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      debtAmount: payment.debtAmount,
      bankCode: payment.bank?.bankId || '',
      customerAccountType: payment.customerAccountType,
      branchCode: payment.branchCode,
      bankAccountNumber: payment.bankAccountNumber,
      debitSequence: payment.debitSequence,
      installmentNumber: payment.installmentNumber,
      debitStatus: payment.debitStatus,
      chargedAmount: payment.chargedAmount,
      remainingDebt: payment.remainingDebt,
      rejectCode: payment.rejectCode,
      rejectText: payment.rejectText,
    });
  }

  // Guardar el archivo Excel en la ruta especificada
  const fileNameWithoutExtension = fileName.replace('.lis', '');
  // eslint-disable-next-line prettier/prettier
  const filePath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'uploads',
    fileNameWithoutExtension + '- Modificado.xlsx'
  );
  await workbook.xlsx.writeFile(filePath);
}
