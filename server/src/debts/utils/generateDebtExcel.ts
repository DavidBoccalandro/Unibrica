import * as ExcelJS from 'exceljs';
import { DebtEntity } from '../entities/debts.entity';
import { DebtorStatistics } from './debtorStatistics.interface';
import path from 'path';

// Método para generar el archivo Excel
export async function generateExcelWithStatistics(
  debts: DebtEntity[],
  debtorStatisticsMap: Record<string, DebtorStatistics>,
  fileName: string
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Deudas');

  // Definir las columnas del archivo Excel
  worksheet.columns = [
    {
      header: 'Sucursal',
      key: 'branchCode',
      width: 8,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
    // { header: 'Tipo de cuenta', key: 'accountType', width: 20 },
    {
      header: 'Cuenta',
      key: 'account',
      width: 17,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
    {
      header: 'ID Deuda',
      key: 'idDebt',
      width: 15,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
    {
      header: 'Vencimiento',
      key: 'dueDate',
      width: 13,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
    {
      header: 'Monto',
      key: 'amount',
      width: 12,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
    {
      header: 'Cliente',
      key: 'client',
      width: 15,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
    {
      header: 'Deudor',
      key: 'debtor',
      width: 30,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
    {
      header: 'Préstamos/mes',
      key: 'loansLastMonth',
      width: 14,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
    {
      header: 'Préstamos/año',
      key: 'loansLastYear',
      width: 14,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
    {
      header: 'Empresas y cantidad de préstamos',
      key: 'clientLoans',
      width: 50,
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    },
  ];

  // Rellenar filas con los datos de deudas y estadísticas de deudores
  for (const debt of debts) {
    const debtorStats = debtorStatisticsMap[debt.debtor.id];

    const clientLoansString =
      debtorStats?.clientLoans.map((cl) => `{ ${cl.client}: ${cl.loans} }`).join(', ') || '';

    worksheet.addRow({
      branchCode: debt.branchCode,
      // accountType: debt.accountType,
      account: debt.account,
      idDebt: debt.idDebt,
      dueDate: debt.dueDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      // currency: debt.currency,
      amount: debt.amount,
      client: debt.client?.name || '',
      debtor: debt.debtor?.lastNames + ' ' + debt.debtor?.firstNames.trim() || '',
      loansLastMonth: debtorStats?.totalLoansLastMonth || 0,
      loansLastYear: debtorStats?.totalLoansLastYear || 0,
      clientLoans: clientLoansString,
    });
  }

  // Guardar el archivo Excel en la ruta especificada
  const fileNameWithoutExtension = fileName.replace('.xls', '');
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
