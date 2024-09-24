import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PaymentRecord } from '../entities/payment.entity';
import { BankEntity } from 'src/banks/entities/banks.entity';
import * as XLSX from 'xlsx';
import { DebtEntity } from 'src/debts/entities/debts.entity';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { findOrCreateSheet } from 'src/reversal/utils/reversal.util';
import { PaginationFilterQueryDto } from 'src/shared/dto/PaginationFIlterQueryDto';
import { rejectionCodes } from '../utils/rejectionCodes';
import { processSdaLines } from '../utils/processSda';
import { generatePaymentExcel } from '../utils/generatePaymentExcel.util';
import { StatisticsEntity } from 'src/statistics/entities/statistic.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,

    @InjectRepository(BankEntity)
    private bankRepository: Repository<BankEntity>,

    @InjectRepository(DebtEntity)
    private debtRepository: Repository<DebtEntity>,

    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,

    @InjectRepository(SheetsEntity)
    private sheetRepository: Repository<SheetsEntity>,

    @InjectRepository(StatisticsEntity)
    private readonly statisticsRepository: Repository<StatisticsEntity>
  ) {}

  async uploadPaymentSheet(
    file: Express.Multer.File,
    clientId: string,
    optionalFile?: Express.Multer.File
  ): Promise<PaymentRecord[]> {
    if (!file) {
      throw new Error('No PAGBA provided');
    }
    if (!optionalFile) {
      throw new Error('No SDA provided');
    }

    // Extrae líneas del PAGBA
    const fileContent = file.buffer.toString('utf-8');
    const lines = fileContent.split('\n');
    const originalFileName = path.basename(file.originalname);

    const processedData: PaymentRecord[] = [];

    // Busca el cliente en la DB
    const clientSearch = await this.clientRepository.find({ where: { clientId: +clientId } });
    const client = clientSearch[0];
    const sheet = await findOrCreateSheet(file.originalname, this.sheetRepository, 'pagos', client);

    // Busca todos los bancos UNA ÚNICA VEZ y crea un Map.
    const allBanks = await this.bankRepository.find();
    const bankMap = new Map(allBanks.map((bank) => [bank.bankId, bank]));

    const sdaDataMap = processSdaLines(optionalFile);

    let totalDebitAmount = 0;
    let totalRemainingDebt = 0;

    for (const line of lines) {
      try {
        const recordType = parseInt(line.substring(0, 1).trim(), 10);
        const agreementNumber = parseInt(line.substring(1, 6).trim(), 10);
        const creditCompany = parseInt(line.substring(16, 21).trim(), 10);
        const companyAccountNumber = line.substring(21, 41).trim();

        // Convertir debitDate a un objeto Date
        const debitDateStr = line.substring(41, 49).trim();
        const year = parseInt(debitDateStr.substring(0, 4), 10);
        const month = parseInt(debitDateStr.substring(4, 6), 10) - 1;
        const day = parseInt(debitDateStr.substring(6, 8), 10);
        const debitDate = new Date(year, month, day);
        const debtAmount = parseFloat(line.substring(49, 60).trim()) / 100;
        const bankCode = line.substring(60, 63).trim();
        const customerAccountType = parseInt(line.substring(63, 64).trim(), 10);
        const branchCode = parseInt(line.substring(64, 67).trim(), 10);
        const bankAccountNumber = line.substring(67, 82).trim();
        const debitSequence = parseInt(line.substring(83, 85).trim(), 10);
        const installmentNumber = parseInt(line.substring(85, 87).trim(), 10);
        const debitStatus = line.substring(87, 88).trim();
        let chargedAmount = parseFloat(line.substring(108, 119).trim()) / 100;
        const rejectCode = sdaDataMap.get(bankAccountNumber) ?? '';
        const rejectText = rejectCode ? rejectionCodes[rejectCode] : '';

        //% debitStatus: E ==> Error; debitStatus: R ==> Rechazado
        if (debitStatus !== 'P') {
          chargedAmount = 0;
        }
        const remainingDebt = +(debtAmount - chargedAmount).toFixed(2);
        if (!isNaN(remainingDebt)) {
          totalRemainingDebt += remainingDebt;
        }
        if (!isNaN(debtAmount)) {
          totalDebitAmount += chargedAmount;
        }
        // console.log('Total debit amount: ', totalDebitAmount, debtAmount);

        let bank = bankMap.get(bankCode);

        if (!bank) {
          bank = this.bankRepository.create({ bankId: bankCode, name: 'Unknown Bank' });
          await this.bankRepository.save(bank);
          bankMap.set(bankCode, bank);
        }

        if (
          isNaN(recordType) ||
          isNaN(agreementNumber) ||
          isNaN(creditCompany) ||
          isNaN(customerAccountType) ||
          isNaN(branchCode) ||
          isNaN(debitSequence) ||
          isNaN(installmentNumber) ||
          isNaN(chargedAmount)
        ) {
          console.log(
            'Error parsing numeric fields for line:',
            recordType,
            agreementNumber,
            creditCompany,
            debtAmount,
            customerAccountType,
            branchCode,
            debitSequence,
            installmentNumber,
            chargedAmount
          );
          continue;
        }

        // Buscar la deuda relacionada en función del account y bankAccountNumber
        const debt = await this.debtRepository.findOne({
          where: {
            account: bankAccountNumber,
          },
          relations: ['bank'],
        });

        if (!debt) {
          // console.log(`No se encontró una deuda relacionada para la cuenta: ${bankAccountNumber}`);
          // console.log('DEBT: ', debt);
        }

        // Crear y guardar el registro de pago
        const paymentRecord = this.paymentRecordRepository.create({
          recordType,
          agreementNumber,
          creditCompany,
          companyAccountNumber,
          debitDate,
          debtAmount,
          bank,
          customerAccountType,
          branchCode,
          bankAccountNumber,
          debitSequence,
          installmentNumber,
          debitStatus,
          chargedAmount,
          remainingDebt,
          debt,
          client,
          sheet,
          rejectCode,
          rejectText,
        });

        processedData.push(paymentRecord);
      } catch (error) {
        console.error(`Error processing line: ${line}. Error: ${error.message}`);
        continue;
      }
    }

    //% Creamos las estadísticas
    const newStat = this.statisticsRepository.create({
      client,
      sheet,
      date: sheet.date,
      totalDebitAmount,
      totalRemainingDebt,
    });
    await this.statisticsRepository.save(newStat);

    //% Creamos archivo Excel
    const filePath = await this.createExcelFile(processedData, originalFileName);
    console.log(`Excel file created at: ${filePath}`);

    await this.paymentRecordRepository.save(processedData);

    generatePaymentExcel(processedData, originalFileName);
    return processedData;
  }

  async getAllPayments(
    paginationQuery: PaginationFilterQueryDto
  ): Promise<{ payments: PaymentRecord[]; totalItems: number }> {
    const { limit, offset, sortBy, sortOrder, stringFilters, numericFilters, dateFilters } =
      paginationQuery;
    let queryBuilder = this.paymentRecordRepository
      .createQueryBuilder('payment_records')
      .leftJoinAndSelect('payment_records.bank', 'bank')
      .leftJoinAndSelect('payment_records.sheet', 'sheet')
      .leftJoinAndSelect('payment_records.client', 'client');

    // Aplicar filtros de cadenas (stringFilters)
    if (stringFilters && stringFilters.length > 0) {
      stringFilters.forEach((filter) => {
        const { filterBy, filterValue } = filter;
        // console.log('filterBy: ', filterBy);
        // console.log('filterValue type: ', typeof filterValue);
        if (filterBy === 'clientName') {
          queryBuilder = queryBuilder.andWhere(`LOWER(client.name) LIKE :filterValue`, {
            filterValue: `%${filterValue.toLowerCase()}%`,
          });
        } else {
          queryBuilder = queryBuilder.andWhere(
            `LOWER(payment_records.${filterBy}) LIKE :filterValue`,
            { filterValue: `%${filterValue.toLowerCase()}%` }
          );
        }
      });
    }

    // Aplicar filtros numéricos (numericFilters)
    if (numericFilters && numericFilters.length > 0) {
      numericFilters.forEach((filter, index) => {
        const { filterBy, operator, filterValue } = filter;
        const value = Number(filterValue);

        if (filterBy === 'clientId') {
          queryBuilder = queryBuilder.andWhere(`client.clientId = :value${index}`, {
            [`value${index}`]: value,
          });
        } else {
          if (operator === '=' && !isNaN(value)) {
            queryBuilder = queryBuilder.andWhere(`payment_records.${filterBy} = :value${index}`, {
              [`value${index}`]: value,
            });
          } else if (operator === '<' && !isNaN(value)) {
            queryBuilder = queryBuilder.andWhere(`payment_records.${filterBy} < :value${index}`, {
              [`value${index}`]: value,
            });
          } else if (operator === '>' && !isNaN(value)) {
            queryBuilder = queryBuilder.andWhere(`payment_records.${filterBy} > :value${index}`, {
              [`value${index}`]: value,
            });
          } else if (operator === '<=' && !isNaN(value)) {
            queryBuilder = queryBuilder.andWhere(`payment_records.${filterBy} <= :value${index}`, {
              [`value${index}`]: value,
            });
          } else if (operator === '>=' && !isNaN(value)) {
            queryBuilder = queryBuilder.andWhere(`payment_records.${filterBy} >= :value${index}`, {
              [`value${index}`]: value,
            });
          }
        }
      });
    }

    // Aplicar filtros de fechas (dateFilters)
    if (dateFilters && dateFilters.length > 0) {
      dateFilters.forEach((filter, index) => {
        const { filterBy, startDate, endDate } = filter;

        if (filterBy === 'fileDate' && startDate && endDate) {
          queryBuilder = queryBuilder.andWhere(
            `sheet.date BETWEEN :startDate${index} AND :endDate${index}`,
            {
              [`startDate${index}`]: startDate,
              [`endDate${index}`]: endDate,
            }
          );
        } else if (startDate && endDate && filterBy) {
          queryBuilder = queryBuilder.andWhere(
            `payment_records.${filterBy} BETWEEN :startDate${index} AND :endDate${index}`,
            {
              [`startDate${index}`]: startDate,
              [`endDate${index}`]: endDate,
            }
          );
        } else {
          throw new BadRequestException('Invalid date range or field for filtering');
        }
      });
    }

    // Ejecuta la consulta para obtener el total de elementos
    const totalItems = await queryBuilder.getCount();

    if (sortBy && sortOrder) {
      const order = {};
      order[`payment_records.${sortBy}`] = sortOrder.toUpperCase();
      queryBuilder = queryBuilder.orderBy(order);
    }

    if (limit) {
      queryBuilder = queryBuilder.limit(limit).offset(offset ?? 0);
    }

    const payments = await queryBuilder.getMany();

    return { payments, totalItems };
  }

  async findOne(id: string): Promise<PaymentRecord> {
    const paymentRecord = await this.paymentRecordRepository.findOne({
      where: { id },
      relations: ['bank'],
    });
    if (!paymentRecord) {
      throw new Error('Payment record not found');
    }
    return paymentRecord;
  }

  async update(id: string, updateData: Partial<PaymentRecord>): Promise<PaymentRecord> {
    await this.paymentRecordRepository.update(id, updateData);
    const updatedRecord = await this.paymentRecordRepository.findOne({
      where: { id },
      relations: ['bank'],
    });
    if (!updatedRecord) {
      throw new Error('Payment record not found');
    }
    return updatedRecord;
  }

  async remove(id: number): Promise<void> {
    const result = await this.paymentRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Payment record not found');
    }
  }

  // Función para crear el archivo Excel
  async createExcelFile(
    paymentRecords: PaymentRecord[],
    originalFileName: string
  ): Promise<string> {
    // Definir los encabezados en español
    const headers = [
      'Convenio',
      'Empresa',
      'N° de abonado',
      'N° Cuenta',
      'Fecha de Débito',
      'Monto deuda',
      'Monto cobrado',
      'Tipo de Cuenta',
      'Banco',
      'Sucursal',
      'Secuencia de Débito',
      'N° Cuota',
      'Estado de Débito',
    ];

    // Mapear los registros a un formato adecuado para el archivo Excel
    const data = paymentRecords.map((record) => ({
      'Convenio': record.agreementNumber,
      'Empresa': record.creditCompany,
      'N° de abonado': record.companyAccountNumber,
      'N° Cuenta': record.bankAccountNumber,
      'Fecha de Débito': record.debitDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      'Monto deuda': record.debtAmount.toFixed(2),
      'Banco': record.bank?.bankId || 'Desconocido',
      'Tipo de Cuenta': record.customerAccountType,
      'Sucursal': record.branchCode,
      'Secuencia de Débito': record.debitSequence,
      'N° Cuota': record.installmentNumber,
      'Estado de Débito': record.debitStatus,
      'Monto cobrado': record.chargedAmount.toFixed(2),
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
      { wch: 21 },
      { wch: 16 },
      { wch: 15 },
      { wch: 9 },
      { wch: 13 },
      { wch: 9 },
      { wch: 9 },
      { wch: 9 },
      { wch: 9 },
      { wch: 9 },
      { wch: 9 },
    ];
    worksheet['!cols'] = wscols;

    // Escribir el archivo en el sistema
    fs.writeFileSync(filePath, XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }));

    return filePath;
  }
}
