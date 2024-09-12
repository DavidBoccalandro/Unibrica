import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import path from 'path';
import { BankEntity } from 'src/banks/entities/banks.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { Repository } from 'typeorm';
import { ReversalRecord } from '../entities/reversal.entity';
import {
  createExcelFile,
  findOrCreateBank,
  findOrCreateSheet,
  parseDate,
} from '../utils/reversal.util';
import { UpdateReversalDto } from '../dto/updateReversalDto';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { PaginationQueryDto } from 'src/debts/controllers/debts.controller';

@Injectable()
export class ReversalService {
  constructor(
    @InjectRepository(BankEntity)
    private readonly bankRepository: Repository<BankEntity>,
    @InjectRepository(ReversalRecord)
    private readonly reversalRecordRepository: Repository<ReversalRecord>,
    @InjectRepository(SheetsEntity)
    private readonly sheetRepository: Repository<SheetsEntity>,
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>
  ) {}

  async uploadReversalSheet(
    file: Express.Multer.File,
    clientId: string
  ): Promise<ReversalRecord[]> {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileContent = file.buffer.toString('utf-8');
    const lines = fileContent.split('\n');
    const originalFileName = path.basename(file.originalname, '.lis');

    const sheet = await findOrCreateSheet(originalFileName, this.sheetRepository, 'reversas');

    // Busca el cliente en la DB
    const clientSearch = await this.clientRepository.find({ where: { clientId: +clientId } });
    const client = clientSearch[0];

    const processedData = await this.processLines(lines, sheet, client);

    const filePath = await createExcelFile(processedData, originalFileName);
    console.log('El archivo fue creado en: ', filePath);

    await this.reversalRecordRepository.save(processedData);
    return processedData;
  }

  private async processLines(
    lines: string[],
    sheet: SheetsEntity,
    client: ClientEntity
  ): Promise<ReversalRecord[]> {
    const processedData: ReversalRecord[] = [];

    for (const line of lines) {
      try {
        const reversalRecord = await this.parseLine(line, sheet, client);
        if (reversalRecord) {
          processedData.push(reversalRecord);
        }
      } catch (error) {
        console.error(`Error processing line: ${line}. Error: ${error.message}`);
      }
    }

    return processedData;
  }

  private async parseLine(
    line: string,
    sheet: SheetsEntity,
    client: ClientEntity
  ): Promise<ReversalRecord | null> {
    // const recordType = parseInt(line.substring(0, 1).trim(), 10); // Filler
    const agreementNumber = parseInt(line.substring(1, 6).trim(), 10); // Nro de convenio
    const serviceNumber = line.substring(6, 16).trim(); // Nro de servicio
    const companyNumber = line.substring(16, 21).trim(); // Nro de empresa de sueldos
    const bankCode = line.substring(21, 24).trim(); // Codigo de banco del adherente
    const branchCode = parseInt(line.substring(24, 28).trim(), 10); // Codigo de sucursal de la cuenta
    const accountType = parseInt(line.substring(28, 29).trim(), 10); // Tipo de cuenta
    const accountNumber = line.substring(29, 44).trim(); // Cuenta bancaria del adherente
    const currentID = line.substring(44, 66).trim(); // Identificación actual del adherente
    const debitID = line.substring(66, 81).trim(); // Identificación del débito

    const movementFunction = line.substring(81, 83).trim(); // Función o uso del movimiento
    const rejectionCode = line.substring(83, 87).trim(); // Código de motivo o rechazo

    // Convertir la fecha de vencimiento a un objeto Date
    const dueDate = parseDate(line.substring(87, 95).trim());

    const debitAmount = parseFloat(line.substring(98, 111).trim()) / 100; // Importe a debitar

    if (
      isNaN(agreementNumber) ||
      isNaN(branchCode) ||
      isNaN(debitAmount) ||
      parseInt(accountNumber, 10) === 0
    ) {
      console.log(`Error parsing line: ${line}`);
      return null;
    }

    const bank = await findOrCreateBank(bankCode, this.bankRepository);

    return this.reversalRecordRepository.create({
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
      client,
    });
  }

  // Obtener todos los registros de reversión
  // async findAll(): Promise<ReversalRecord[]> {
  //   return this.reversalRecordRepository.find({ relations: ['sheet'] });
  // }
  async findAll(
    paginationQuery: PaginationQueryDto
  ): Promise<{ reversals: ReversalRecord[]; totalItems: number }> {
    const { limit, offset, sortBy, sortOrder, filterBy, filterValue, date, startDate, endDate } =
      paginationQuery;
    let queryBuilder = this.reversalRecordRepository
      .createQueryBuilder('reversal_records')
      .leftJoinAndSelect('reversal_records.bank', 'bank');

    if (filterBy && ['debitID', 'currentID', 'accountNumber'].includes(filterBy)) {
      const lowerFilterValue = filterValue.toLowerCase();
      queryBuilder = queryBuilder.where(`LOWER(reversal_records.${filterBy}) LIKE :filterValue`, {
        filterValue: `%${lowerFilterValue}%`,
      });
    }

    if (startDate && endDate) {
      if (date && ['createdAt', 'updatedAt', 'dueDate'].includes(date)) {
        queryBuilder = queryBuilder.andWhere(
          `reversal_records.${date} >= :startDate AND reversal_records.${date} <= :endDate`,
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
      order[`reversal_records.${sortBy}`] = sortOrder.toUpperCase();
      queryBuilder = queryBuilder.orderBy(order);
    }

    if (limit) {
      queryBuilder = queryBuilder.limit(limit).offset(offset ?? 0);
    }

    const reversals = await queryBuilder.getMany();

    return { reversals, totalItems };
  }

  // Obtener un registro de reversión por ID
  async findOne(id: string): Promise<ReversalRecord> {
    return this.reversalRecordRepository.findOne({ where: { id } });
  }

  // Actualizar un registro de reversión
  async update(id: string, updateReversalDto: UpdateReversalDto): Promise<ReversalRecord> {
    await this.reversalRecordRepository.update(id, updateReversalDto);
    return this.findOne(id);
  }

  // Eliminar un registro de reversión
  async remove(id: number): Promise<void> {
    await this.reversalRecordRepository.delete(id);
  }

  async findBySheet(id: string): Promise<ReversalRecord[]> {
    return this.reversalRecordRepository.find({ where: { sheet: { id } } });
  }
}
