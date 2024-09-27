import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import path from 'path';
import { BankEntity } from 'src/banks/entities/banks.entity';
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
import { PaginationFilterQueryDto } from 'src/shared/dto/PaginationFIlterQueryDto';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { StatisticsReversalEntity } from 'src/statistics/entities/statisticsReversal.entity';

@Injectable()
export class ReversalService {
  constructor(
    @InjectRepository(BankEntity)
    private readonly bankRepository: Repository<BankEntity>,
    @InjectRepository(ReversalRecord)
    private readonly reversalRecordRepository: Repository<ReversalRecord>,
    @InjectRepository(SheetEntity)
    private readonly sheetRepository: Repository<SheetEntity>,
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,
    @InjectRepository(StatisticsReversalEntity)
    private readonly statisticsReversalRepository: Repository<StatisticsReversalEntity>
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

    // Busca el cliente en la DB
    const clientSearch = await this.clientRepository.find({
      where: { agreementNumber: +clientId },
    });
    const client = clientSearch[0];
    const sheet = await findOrCreateSheet(
      originalFileName,
      this.sheetRepository,
      'reversas',
      client
    );

    const processedData = await this.processLines(lines, sheet, client);

    const filePath = await createExcelFile(processedData, originalFileName);
    console.log('El archivo fue creado en: ', filePath);

    await this.reversalRecordRepository.save(processedData);
    return processedData;
  }

  private async processLines(
    lines: string[],
    sheet: SheetEntity,
    client: ClientEntity
  ): Promise<ReversalRecord[]> {
    const processedData: ReversalRecord[] = [];
    let totalReversalAmount = 0;

    for (const line of lines) {
      try {
        const reversalRecord = await this.parseLine(line, sheet, client);
        if (reversalRecord) {
          processedData.push(reversalRecord);
          totalReversalAmount += reversalRecord.debitAmount;
        }
      } catch (error) {
        console.error(`Error processing line: ${line}. Error: ${error.message}`);
      }
    }

    await this.updateStatisticsReversal(client, sheet, totalReversalAmount);
    return processedData;
  }

  private async parseLine(
    line: string,
    sheet: SheetEntity,
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
    const currentId = line.substring(44, 66).trim(); // Identificación actual del adherente
    const debitId = line.substring(66, 81).trim(); // Identificación del débito

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
      currentId,
      debitId,
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
    paginationQuery: PaginationFilterQueryDto
  ): Promise<{ reversals: ReversalRecord[]; totalItems: number }> {
    const { limit, offset, sortBy, sortOrder, stringFilters, numericFilters, dateFilters } =
      paginationQuery;
    let queryBuilder = this.reversalRecordRepository
      .createQueryBuilder('reversal_records')
      .leftJoinAndSelect('reversal_records.bank', 'bank')
      .leftJoinAndSelect('reversal_records.client', 'client')
      .leftJoinAndSelect('reversal_records.sheet', 'sheet');

    // Aplicar filtros de cadenas (stringFilters)
    if (stringFilters && stringFilters.length > 0) {
      stringFilters.forEach((filter, index) => {
        const { filterBy, filterValue } = filter;

        // if (filterBy === 'debtorLastname') {
        //   queryBuilder = queryBuilder.andWhere(`LOWER(debtor.lastname) LIKE :filterValue${index}`, {
        //     [`filterValue${index}`]: `%${filterValue.toLowerCase()}%`,
        //   });
        // } else if (filterBy === 'dni') {
        //   queryBuilder = queryBuilder.andWhere(`LOWER(debtor.dni) LIKE :filterValue${index}`, {
        //     [`filterValue${index}`]: `%${filterValue.toLowerCase()}%`,
        //   });
        // } else
        if (filterBy === 'clientName') {
          queryBuilder = queryBuilder.andWhere(`LOWER(client.name) LIKE :filterValue${index}`, {
            [`filterValue${index}`]: `%${filterValue.toLowerCase()}%`,
          });
        } else {
          queryBuilder = queryBuilder.andWhere(
            `LOWER(reversal_records.${filterBy}) LIKE :filterValue${index}`,
            {
              [`filterValue${index}`]: `%${filterValue.toLowerCase()}%`,
            }
          );
        }
      });
    }

    // Aplicar filtros numéricos (numericFilters)
    if (numericFilters && numericFilters.length > 0) {
      numericFilters.forEach((filter, index) => {
        const { filterBy, operator, filterValue } = filter;
        const value = Number(filterValue);

        if (operator === '=' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`reversal_records.${filterBy} = :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '<' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`reversal_records.${filterBy} < :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '>' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`reversal_records.${filterBy} > :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '<=' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`reversal_records.${filterBy} <= :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '>=' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`reversal_records.${filterBy} >= :value${index}`, {
            [`value${index}`]: value,
          });
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
            `reversal_records.${filterBy} BETWEEN :startDate${index} AND :endDate${index}`,
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

  private async updateStatisticsReversal(
    client: ClientEntity,
    sheet: SheetEntity,
    totalReversalAmount: number
  ): Promise<void> {
    let statistics = await this.statisticsReversalRepository.findOne({
      where: { client, sheet },
    });

    if (statistics) {
      // Actualizar las estadísticas si ya existen
      statistics.totalReversalAmount += totalReversalAmount;
    } else {
      // Crear un nuevo registro si no existe
      statistics = this.statisticsReversalRepository.create({
        client,
        sheet,
        totalReversalAmount,
        date: new Date(), // Puedes ajustar la fecha según tu lógica
      });
    }

    await this.statisticsReversalRepository.save(statistics);
  }
}
