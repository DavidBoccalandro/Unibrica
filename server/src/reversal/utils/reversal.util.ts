import { BankEntity } from 'src/banks/entities/banks.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { Repository } from 'typeorm';
import { ReversalRecord } from '../entities/reversal.entity';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export async function findOrCreateSheet(
  originalFileName: string,
  sheetRepository: Repository<SheetsEntity>
): Promise<SheetsEntity> {
  let sheet = await sheetRepository.findOne({ where: { fileName: originalFileName } });

  if (!sheet) {
    const date = extractDateFromFileName(originalFileName);

    sheet = sheetRepository.create({
      fileName: originalFileName,
      date,
    });
    await sheetRepository.save(sheet);
  }

  return sheet;
}

export function extractDateFromFileName(fileName: string): Date | null {
  const regex = /_(\d{6})_/;
  const match = fileName.match(regex);

  if (match) {
    const dateString = match[1];
    const day = parseInt(dateString.slice(0, 2), 10);
    const month = parseInt(dateString.slice(2, 4), 10) - 1;
    const year = parseInt('20' + dateString.slice(4, 6), 10);
    return new Date(year, month, day);
  }

  return null;
}

export async function findOrCreateBank(
  bankCode: string,
  bankRepository: Repository<BankEntity>
): Promise<BankEntity> {
  let bank = await bankRepository.findOne({ where: { bankId: bankCode } });
  if (!bank) {
    bank = bankRepository.create({ bankId: bankCode, name: 'Unknown Bank' });
    await bankRepository.save(bank);
  }
  return bank;
}

export function parseDate(dueDateStr: string): Date {
  const year = parseInt(dueDateStr.substring(0, 4), 10);
  const month = parseInt(dueDateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dueDateStr.substring(6, 8), 10);
  return new Date(year, month, day);
}

export async function createExcelFile(
  reversalRecords: ReversalRecord[],
  originalFileName: string
): Promise<string> {
  const headers = [
    'N° convenio',
    'N° servicio',
    'N° empresa',
    'Banco',
    'Sucursal',
    'Tipo de cuenta',
    'N° cuenta',
    'Id usuario',
    'Id del débito',
    'C° mov',
    'C° rechazo',
    'Vencimiento',
    'Importe a debitar',
  ];

  const data = reversalRecords.map((record) => ({
    'N° convenio': record.agreementNumber,
    'N° servicio': record.serviceNumber,
    'N° empresa': record.companyNumber,
    'Banco': record.bank?.bankId || 'Desconocido',
    'Sucursal': record.branchCode,
    'Tipo de cuenta': record.accountType,
    'N° cuenta': record.accountNumber,
    'Id usuario': record.currentID,
    'Id del débito': record.debitID,
    'C° mov': record.movementFunction,
    'C° rechazo': record.rejectionCode,
    'Vencimiento': record.dueDate.toISOString().split('T')[0],
    'Importe a debitar': record.debitAmount.toFixed(2),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reversiones');

  const fileNameWithoutExtension = originalFileName + '.xlsx';
  const filePath = path.join(__dirname, '..', '..', '..', 'uploads', fileNameWithoutExtension);

  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
    { wch: 23 },
    { wch: 25 },
    { wch: 9 },
    { wch: 9 },
    { wch: 12 },
    { wch: 20 },
  ];

  fs.writeFileSync(filePath, XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }));

  return filePath;
}
