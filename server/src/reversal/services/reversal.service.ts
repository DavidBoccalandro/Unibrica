import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankEntity } from 'src/banks/entities/banks.entity';
import { ReversalRecord } from '../entities/reversal.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class ReversalService {
  constructor(
    @InjectRepository(BankEntity)
    private readonly bankRepository: Repository<BankEntity>,
    @InjectRepository(ReversalRecord)
    private readonly reversalRecordRepository: Repository<ReversalRecord>,
    @InjectRepository(SheetsEntity)
    private readonly sheetRepository: Repository<SheetsEntity>
  ) {}

  async uploadReversalSheet(file: Express.Multer.File): Promise<ReversalRecord[]> {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileContent = file.buffer.toString('utf-8');
    const lines = fileContent.split('\n');
    const originalFileName = path
      .basename(file.originalname)
      .substring(0, file.originalname.length - 4);

    // Buscar o crear el banco
    let sheet = await this.sheetRepository.findOne({ where: { fileName: originalFileName } });
    if (!sheet) {
      // Creación SheetEntity
      sheet = new SheetsEntity();
      sheet.fileName = originalFileName;
      // sheet.client = // TODO
      const regex = /_(\d{6})_/;
      const match = originalFileName.match(regex);
      let date;

      if (match) {
        const dateString = match[1];
        const day = parseInt(dateString.slice(0, 2));
        const month = parseInt(dateString.slice(2, 4));
        const year = parseInt('20' + dateString.slice(4, 6));

        date = new Date(year, month, day);
        console.log('Date: ', date);
      }

      sheet = this.sheetRepository.create({
        fileName: originalFileName,
        date: date,
      });
      await this.sheetRepository.save(sheet);
    }

    const processedData: ReversalRecord[] = [];

    for (const line of lines) {
      console.log('Se ejecuta una linea');
      try {
        // const recordType = parseInt(line.substring(0, 1).trim(), 10); // Filler
        const agreementNumber = parseInt(line.substring(1, 6).trim(), 10); // Nro de convenio
        const serviceNumber = line.substring(6, 16).trim(); // Nro de servicio
        const companyNumber = line.substring(16, 21).trim(); // Nro de empresa de sueldos
        const bankCode = line.substring(21, 24).trim(); // Codigo de banco del adherente
        const branchCode = parseInt(line.substring(24, 28).trim(), 10); // Codigo de sucursal de la cuenta
        const accountType = parseInt(line.substring(28, 29).trim(), 10); // Tipo de cuenta
        const accountNumber = line.substring(29, 44).trim(); // Cuenta bancaria del adherente
        const currentID = line.substring(44, 66).trim(); // Identificacion actual del adherente
        const debitID = line.substring(66, 81).trim(); // Identificacion del debito

        const movementFunction = line.substring(81, 83).trim(); // Función o uso del movimiento
        const rejectionCode = line.substring(83, 87).trim(); // Código de motivo o rechazo

        // Convertir la fecha de vencimiento a un objeto Date
        const dueDateStr = line.substring(87, 95).trim(); // Fecha de vencimiento en formato AAAAMMDD
        const year = parseInt(dueDateStr.substring(0, 4), 10);
        const month = parseInt(dueDateStr.substring(4, 6), 10) - 1; // Mes empieza en 0 para Date
        const day = parseInt(dueDateStr.substring(6, 8), 10);
        const dueDate = new Date(year, month, day);

        const debitAmount = parseFloat(line.substring(98, 111).trim()) / 100; // Importe a debitar

        // Validaciones adicionales si es necesario
        if (
          isNaN(agreementNumber) ||
          isNaN(branchCode) ||
          isNaN(debitAmount) ||
          parseInt(accountNumber, 10) === 0
        ) {
          console.log(`Error parsing line: ${line}`);
          continue;
        }

        // Buscar o crear el banco
        let bank = await this.bankRepository.findOne({ where: { bankId: bankCode } });
        if (!bank) {
          bank = this.bankRepository.create({ bankId: bankCode, name: 'Unknown Bank' });
          await this.bankRepository.save(bank);
        }

        // Crear y guardar el registro de reversión
        const reversalRecord = this.reversalRecordRepository.create({
          agreementNumber,
          serviceNumber,
          companyNumber,
          bank,
          branchCode,
          accountType,
          accountNumber,
          currentID,
          debitID,
          movementFunction,
          rejectionCode,
          dueDate,
          debitAmount,
          sheet,
        });

        console.log('Reversal: ', {
          agreementNumber,
          serviceNumber,
          companyNumber,
          bank,
          branchCode,
          accountType,
          accountNumber,
          currentID,
          debitID,
          movementFunction,
          rejectionCode,
          dueDate,
          debitAmount,
          sheet,
        });
        await this.reversalRecordRepository.save(reversalRecord);
        processedData.push(reversalRecord);
      } catch (error) {
        console.error(`Error processing line: ${line}. Error: ${error.message}`);
        continue;
      }
    }

    const filePath = await this.createExcelFile(processedData, originalFileName);
    console.log('El archivo fue creado en: ', filePath);

    // Opcionalmente, puedes generar un archivo Excel o hacer otra acción
    return processedData;
  }

  // Función para crear el archivo Excel
  async createExcelFile(
    reversalRecords: ReversalRecord[],
    originalFileName: string
  ): Promise<string> {
    // Definir los encabezados en español
    const headers = [
      'N° convenio', // agreementNumber
      'N° servicio', // serviceNumber
      'N° empresa', // companyNumber
      'Banco', // bank
      'Sucursal', // branchCode
      'Tipo de cuenta', // accountType
      'N° cuenta', // accountNumber
      'Id usuario', // currentID
      'Id del débito', // debitID
      'C° mov', // movementFunction
      'C° rechazo', // rejectionCode
      'Vencimiento', // dueDate
      'Importe a debitar', // debitAmount
    ];

    // Mapear los registros a un formato adecuado para el archivo Excel
    const data = reversalRecords.map((record) => ({
      'N° convenio': record.agreementNumber,
      'N° servicio': record.serviceNumber,
      'N° empresa': record.companyNumber,
      'Banco': record.bank?.bankId || 'Desconocido', // Manejo del banco si está relacionado
      'Sucursal': record.branchCode,
      'Tipo de cuenta': record.accountType,
      'N° cuenta': record.accountNumber,
      'Id usuario': record.currentID,
      'Id del débito': record.debitID,
      'C° mov': record.movementFunction,
      'C° rechazo': record.rejectionCode,
      'Vencimiento': record.dueDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      'Importe a debitar': record.debitAmount.toFixed(2),
    }));

    // Crear una hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new();
    // Añadir la hoja de trabajo al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros de Pago');

    // Eliminar la extensión .lis del nombre del archivo original
    const fileNameWithoutExtension = originalFileName.replace('.lis', '') + '.xlsx';
    // Ruta para guardar el archivo Excel
    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', fileNameWithoutExtension);

    const wscols = [
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
    ];
    worksheet['!cols'] = wscols;

    // Escribir el archivo en el sistema
    fs.writeFileSync(filePath, XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }));

    return filePath;
  }
}
