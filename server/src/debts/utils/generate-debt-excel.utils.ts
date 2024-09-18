import { DebtEntity } from '../entities/debts.entity';
import * as XLSX from 'xlsx';
import { join } from 'path';

export async function generateDebtsExcel(debts: DebtEntity[]): Promise<string> {
  // Prepare data for Excel
  const excelData = debts.map((debt) => ({
    'Id de Deuda': debt.idDebt,
    'Importe': debt.amount,
    'Fecha de Vencimiento': debt.dueDate.toLocaleDateString(),
    'Sucursal': debt.branchCode,
    'Tipo de Cuenta': debt.accountType,
    'Número de Cuenta': debt.account,
    'Moneda': debt.currency,
    'Banco': debt.bank ? debt.bank.name : 'N/A',
    'Deudor': debt.debtor ? `${debt.debtor.firstNames} ${debt.debtor.lastNames}` : 'N/A',
    'Cliente': debt.client ? debt.client.name : 'N/A',
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Debts');

  // Define path to save the file
  const filePath = join(__dirname, '..', 'uploads', `Debts_${Date.now()}.xlsx`);

  // Write the Excel file to the file system
  XLSX.writeFile(workbook, filePath);

  return filePath; // Return the path to the generated Excel file
}
