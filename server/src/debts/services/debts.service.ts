import { InjectRepository } from '@nestjs/typeorm';
import * as XLSX from 'xlsx';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { BankEntity } from '../../banks/entities/banks.entity';
import { DebtEntity } from '../entities/debts.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { DebtorEntity } from '../entities/debtors.entity';
import { findOrCreateSheet } from 'src/reversal/utils/reversal.util';
import { PaginationFilterQueryDto } from 'src/shared/dto/PaginationFIlterQueryDto';
import { RepeatedDebtorEntity } from 'src/repeated-debtor/entities/repeated-debtor.entity';
import { generateDebtorStatistics } from '../utils/generateDebtorStatistics.utils';
import { generateExcelWithStatistics } from '../utils/generateDebtExcel';
import { processDebtExcelRow, handleDebtor, createDebt } from '../utils/processFileRowFunctions';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(SheetEntity) private readonly sheetRepository: Repository<SheetEntity>,
    @InjectRepository(DebtorEntity) private readonly debtorRepository: Repository<DebtorEntity>,
    @InjectRepository(DebtEntity) private readonly debtRepository: Repository<DebtEntity>,
    @InjectRepository(BankEntity) private readonly bankRepository: Repository<BankEntity>,
    @InjectRepository(ClientEntity) private readonly clientRepository: Repository<ClientEntity>,
    @InjectRepository(RepeatedDebtorEntity)
    private readonly repeatedDebtorRepository: Repository<RepeatedDebtorEntity>
  ) {}

  public async uploadDebtSheet(file: Express.Multer.File, clientId: string): Promise<string> {
    try {
      const workbook = XLSX.readFile(file.path);
      const excelSheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(excelSheet);

      const blockSize = 200; // Tamaño del bloque

      // Busca el cliente en la DB
      const clientSearch = await this.clientRepository.find({ where: { clientId: +clientId } });
      const client = clientSearch[0];
      if (!client) {
        throw new Error('Client not found');
      }
      const sheet = await findOrCreateSheet(
        file.originalname,
        this.sheetRepository,
        'deudas',
        client
      );

      for (let startRow = 0; startRow <= excelData.length; startRow += blockSize) {
        const endRow = Math.min(startRow + blockSize, excelData.length);
        const blockData = excelData.slice(startRow, endRow);
        await this.processDebtSheet(blockData, client, sheet, file.originalname);
      }

      return 'Debt sheet uploaded successfully, and it is being processed.';
    } catch (error) {
      throw new Error('Error uploading debt sheet: ' + error.message);
    }
  }

  /*
   * Function to process de file
   */
  public async processDebtSheet(
    excelData: any,
    client: ClientEntity,
    sheet: SheetEntity,
    fileName: string
  ) {
    const debts: DebtEntity[] = [];
    const debtors: DebtorEntity[] = [];

    const allBanks = await this.bankRepository.find();
    const bankMap = new Map(allBanks.map((bank) => [bank.bankId, bank]));

    const allDebtors = await this.debtorRepository.find({ relations: ['sheet'] });
    const debtorsMap = new Map(allDebtors.map((debtor) => [debtor.dni, debtor]));

    const debtorIds: string[] = [];

    for (const row of excelData) {
      //% Procesa la fila del Excel
      const processedRow = processDebtExcelRow(row, bankMap);

      //% Maneja el deudor (crear o actualizar)
      const debtor = await handleDebtor(processedRow, sheet, debtorsMap);

      //% Crea una deuda a partir de la fila
      const debt = createDebt(processedRow, debtor, client, sheet);

      //% Agrega las deudas y deudores a sus respectivos arrays
      debts.push(debt);
      if (!debtorsMap.has(debtor.dni)) debtors.push(debtor);

      debtorIds.push(debtor.id);
    }

    // Save all entities in DB
    try {
      await this.debtorRepository.save(debtors);
      await this.debtRepository.save(debts);

      //% Genera las estadísticas de los deudores
      const debtorStatistics = await generateDebtorStatistics(debtorIds, this.debtRepository);
      //% Generar el archivo Excel con estadísticas
      await generateExcelWithStatistics(debts, debtorStatistics, fileName);
      console.log('Se generó el Excel modificado');
    } catch (error) {
      console.error('Error saving entities:', error);
      throw new Error('Error processing debt sheet: ' + error.message);
    }
  }

  async getAllDebts(paginationQuery: PaginationFilterQueryDto) {
    const { limit, offset, sortBy, sortOrder, stringFilters, numericFilters, dateFilters } =
      paginationQuery;
    let queryBuilder = this.debtRepository
      .createQueryBuilder('debts')
      .leftJoinAndSelect('debts.debtor', 'debtor')
      .leftJoinAndSelect('debts.client', 'client')
      .leftJoinAndSelect('debts.sheet', 'sheet');

    // Aplicar filtros de cadenas (stringFilters)
    if (stringFilters && stringFilters.length > 0) {
      stringFilters.forEach((filter, index) => {
        const { filterBy, filterValue } = filter;

        if (filterBy === 'lastNames') {
          queryBuilder = queryBuilder.andWhere(
            `LOWER(debtor.lastNames) LIKE :filterValue${index}`,
            {
              [`filterValue${index}`]: `%${filterValue.toLowerCase()}%`,
            }
          );
        } else if (filterBy === 'dni') {
          queryBuilder = queryBuilder.andWhere(`LOWER(debtor.dni) LIKE :filterValue${index}`, {
            [`filterValue${index}`]: `%${filterValue.toLowerCase()}%`,
          });
        } else if (filterBy === 'clientName') {
          queryBuilder = queryBuilder.andWhere(`LOWER(client.name) LIKE :filterValue${index}`, {
            [`filterValue${index}`]: `%${filterValue.toLowerCase()}%`,
          });
        } else {
          queryBuilder = queryBuilder.andWhere(
            `LOWER(debts.${filterBy}) LIKE :filterValue${index}`,
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
          queryBuilder = queryBuilder.andWhere(`debts.${filterBy} = :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '<' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`debts.${filterBy} < :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '>' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`debts.${filterBy} > :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '<=' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`debts.${filterBy} <= :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '>=' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`debts.${filterBy} >= :value${index}`, {
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
            `debts.${filterBy} BETWEEN :startDate${index} AND :endDate${index}`,
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

    const totalItems = await queryBuilder.getCount();

    if (sortBy && sortOrder) {
      const order = {};
      order[`debts.${sortBy}`] = sortOrder.toUpperCase();
      queryBuilder = queryBuilder.orderBy(order);
    }

    if (limit) {
      queryBuilder = queryBuilder.limit(limit).offset(offset ?? 0);
    }

    const debts = await queryBuilder.getMany();

    return { debts, totalItems };
  }
}
