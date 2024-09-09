import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PaymentRecord } from '../entities/payment.entity';
import { BankEntity } from 'src/banks/entities/banks.entity';
import { PaginationQueryDto } from 'src/debts/controllers/debts.controller';
import * as XLSX from 'xlsx';
import { DebtEntity } from 'src/debts/entities/debts.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,

    @InjectRepository(BankEntity)
    private bankRepository: Repository<BankEntity>,

    @InjectRepository(DebtEntity)
    private debtRepository: Repository<DebtEntity>
  ) {}

  async uploadPaymentSheet(file: Express.Multer.File): Promise<PaymentRecord[]> {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileContent = file.buffer.toString('utf-8');
    const lines = fileContent.split('\n');
    const originalFileName = path.basename(file.originalname);

    const processedData: PaymentRecord[] = [];

    const allBanks = await this.bankRepository.find();
    const bankMap = new Map(allBanks.map((bank) => [bank.bankId, bank]));

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
        const subscriberID = line.substring(49, 60).trim();
        const bankCode = line.substring(60, 63).trim();
        const customerAccountType = parseInt(line.substring(63, 64).trim(), 10);
        const branchCode = parseInt(line.substring(64, 67).trim(), 10);
        const bankAccountNumber = line.substring(67, 82).trim();
        const debitSequence = parseInt(line.substring(83, 85).trim(), 10);
        const installmentNumber = parseInt(line.substring(85, 87).trim(), 10);
        const debitStatus = line.substring(87, 88).trim();
        const chargedAmount = parseFloat(line.substring(108, 119).trim()) / 100;

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
            subscriberID,
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
          console.log(`No se encontró una deuda relacionada para la cuenta: ${bankAccountNumber}`);
          console.log('DEBT: ', debt);
        }

        // Crear y guardar el registro de pago
        const paymentRecord = this.paymentRecordRepository.create({
          recordType,
          agreementNumber,
          creditCompany,
          companyAccountNumber,
          debitDate,
          subscriberID,
          bank,
          customerAccountType,
          branchCode,
          bankAccountNumber,
          debitSequence,
          installmentNumber,
          debitStatus,
          chargedAmount,
          debt,
        });

        processedData.push(paymentRecord);
      } catch (error) {
        console.error(`Error processing line: ${line}. Error: ${error.message}`);
        continue;
      }
    }

    // Crear archivo Excel
    const filePath = await this.createExcelFile(processedData, originalFileName);
    console.log(`Excel file created at: ${filePath}`);

    await this.paymentRecordRepository.save(processedData);
    return processedData;
  }

  async findAll(
    paginationQuery: PaginationQueryDto
  ): Promise<{ payments: PaymentRecord[]; totalItems: number }> {
    const { limit, offset, sortBy, sortOrder, filterBy, filterValue, date, startDate, endDate } =
      paginationQuery;
    let queryBuilder = this.paymentRecordRepository
      .createQueryBuilder('payment_records')
      .leftJoinAndSelect('payment_records.bank', 'bank');

    if (
      filterBy &&
      ['companyAccountNumber', 'subscriberID', 'bankAccountNumber'].includes(filterBy)
    ) {
      const lowerFilterValue = filterValue.toLowerCase();
      queryBuilder = queryBuilder.where(`LOWER(payment_records.${filterBy}) LIKE :filterValue`, {
        filterValue: `%${lowerFilterValue}%`,
      });
    }

    if (startDate && endDate) {
      if (date && ['createdAt', 'updatedAt', 'dueDate'].includes(date)) {
        queryBuilder = queryBuilder.andWhere(
          `payment_records.${date} >= :startDate AND payment_records.${date} <= :endDate`,
          { startDate, endDate }
        );
      } else {
        throw new BadRequestException('Invalid date field specified for filtering');
      }
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

  async findOne(id: number): Promise<PaymentRecord> {
    const paymentRecord = await this.paymentRecordRepository.findOne({
      where: { id },
      relations: ['bank'],
    });
    if (!paymentRecord) {
      throw new Error('Payment record not found');
    }
    return paymentRecord;
  }

  async update(id: number, updateData: Partial<PaymentRecord>): Promise<PaymentRecord> {
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
      'Registro',
      'Convenio',
      'Empresa',
      'N° de abonado',
      'Fecha de Débito',
      'ID del Suscriptor',
      'Banco',
      'Tipo de Cuenta',
      'Sucursal',
      'N° Cuenta Banco',
      'Secuencia de Débito',
      'N° Cuota',
      'Estado de Débito',
      'Monto cobrado',
    ];

    // Mapear los registros a un formato adecuado para el archivo Excel
    const data = paymentRecords.map((record) => ({
      'Registro': record.recordType,
      'Convenio': record.agreementNumber,
      'Empresa': record.creditCompany,
      'N° de abonado': record.companyAccountNumber,
      'Fecha de Débito': record.debitDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      'ID del Suscriptor': record.subscriberID,
      'Banco': record.bank?.name || 'Desconocido',
      'Tipo de Cuenta': record.customerAccountType,
      'Sucursal': record.branchCode,
      'N° Cuenta Banco': record.bankAccountNumber,
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
      { wch: 10 },
      { wch: 21 },
      { wch: 13 },
      { wch: 15 },
      { wch: 9 },
      { wch: 9 },
      { wch: 9 },
      { wch: 16 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
    ];
    worksheet['!cols'] = wscols;

    // Escribir el archivo en el sistema
    fs.writeFileSync(filePath, XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }));

    return filePath;
  }
}
