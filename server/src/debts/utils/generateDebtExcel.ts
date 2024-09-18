import * as ExcelJS from 'exceljs';
import { DebtEntity } from '../entities/debts.entity';
import { DebtorStatistics } from './debtorStatistics.interface';
import path from 'path';

// Método para generar el archivo Excel
export async function generateExcelWithStatistics(
  debts: DebtEntity[],
  debtorStatisticsMap: Map<string, DebtorStatistics>,
  fileName: string
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Deudas');

  // Definir las columnas del archivo Excel
  worksheet.columns = [
    { header: 'ID Préstamo', key: 'idDebt', width: 15 },
    { header: 'Código de sucursal', key: 'branchCode', width: 20 },
    { header: 'Tipo de cuenta', key: 'accountType', width: 20 },
    { header: 'Cuenta', key: 'account', width: 25 },
    { header: 'ID Deuda', key: 'idDebt', width: 15 },
    { header: 'Fecha de vencimiento', key: 'dueDate', width: 20 },
    { header: 'Moneda', key: 'currency', width: 10 },
    { header: 'Monto', key: 'amount', width: 15 },
    { header: 'Cliente', key: 'client', width: 20 },
    { header: 'Deudor', key: 'debtor', width: 30 },
    { header: 'Préstamos último mes', key: 'loansLastMonth', width: 25 },
    { header: 'Préstamos último año', key: 'loansLastYear', width: 25 },
    { header: 'Empresas prestamistas y cantidad de préstamos', key: 'clientLoans', width: 50 },
  ];

  // Rellenar filas con los datos de deudas y estadísticas de deudores
  for (const debt of debts) {
    const debtorStats = debtorStatisticsMap.get(debt.debtor.id);

    const clientLoansString =
      debtorStats?.statistics.clientLoans.map((cl) => `{ ${cl.client}: ${cl.loans} }`).join(', ') ||
      '';

    worksheet.addRow({
      branchCode: debt.branchCode,
      accountType: debt.accountType,
      account: debt.account,
      idDebt: debt.idDebt,
      dueDate: debt.dueDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      currency: debt.currency,
      amount: debt.amount,
      client: debt.client?.name || '',
      debtor: debt.debtor?.lastNames + ' ' + debt.debtor?.firstNames.trim() || '',
      loansLastMonth: debtorStats?.statistics.totalLoansLastMonth || 0,
      loansLastYear: debtorStats?.statistics.totalLoansLastYear || 0,
      clientLoans: clientLoansString,
    });
  }

  // Guardar el archivo Excel en la ruta especificada
  const fileNameWithoutExtension = fileName.replace('.xls', '');
  // eslint-disable-next-line prettier/prettier
  const filePath = path.join(__dirname, '..', '..', '..', 'uploads', fileNameWithoutExtension + '- Modificado.xlsx');
  await workbook.xlsx.writeFile(filePath);
}
