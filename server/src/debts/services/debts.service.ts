import { InjectRepository } from '@nestjs/typeorm';
import * as XLSX from 'xlsx';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { BankEntity } from '../../banks/entities/banks.entity';
import { DebtEntity } from '../entities/debts.entity';
import { PaginationQueryDto } from '../controllers/debts.controller';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { DebtorEntity } from '../entities/debtors.entity';
import { findOrCreateSheet } from 'src/reversal/utils/reversal.util';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(SheetsEntity) private readonly sheetRepository: Repository<SheetsEntity>,
    @InjectRepository(DebtorEntity) private readonly debtorRepository: Repository<DebtorEntity>,
    @InjectRepository(DebtEntity) private readonly debtRepository: Repository<DebtEntity>,
    @InjectRepository(BankEntity) private readonly bankRepository: Repository<BankEntity>,
    @InjectRepository(ClientEntity) private readonly clientRepository: Repository<ClientEntity>
  ) {}

  public async uploadDebtSheet(file: Express.Multer.File, clientId: string): Promise<string> {
    try {
      const workbook = XLSX.readFile(file.path);
      const excelSheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(excelSheet);

      const blockSize = 200; // Tamaño del bloque

      // const sheet = await findOrCreateSheet(file.filename, this.sheetRepository);

      // Busca el cliente en la DB
      const clientSearch = await this.clientRepository.find({ where: { clientId: +clientId } });
      const client = clientSearch[0];
      if (!client) {
        throw new Error('Client not found');
      }

      for (let startRow = 1; startRow < excelData.length; startRow += blockSize) {
        const endRow = Math.min(startRow + blockSize, excelData.length);
        const blockData = excelData.slice(startRow, endRow);

        await this.processDebtSheet(blockData, client);
      }

      return 'Debt sheet uploaded successfully, and it is being processed.';
    } catch (error) {
      throw new Error('Error uploading debt sheet: ' + error.message);
    }
  }

  /*
   * Function to process de file
   */
  public async processDebtSheet(excelData: any, client: ClientEntity) {
    const debts: DebtEntity[] = [];
    const debtors: DebtorEntity[] = [];

    const allBanks = await this.bankRepository.find();
    const bankMap = new Map(allBanks.map((bank) => [bank.bankId, bank]));

    const allDebtors = await this.debtorRepository.find();
    const debtorsMap = new Map(allDebtors.map((debtor) => [debtor.dni, debtor]));

    for (const row of excelData) {
      // Check if debt exists
      let debtor = debtorsMap.get(row['DNI']);
      const bank = bankMap.get(row['bank']) ?? null;

      if (!debtor && row['DNI']) {
        debtor = new DebtorEntity();
        debtor.dni = row['DNI'];
        const splitName = row['NOMBRE Y APELLIDO'].split(' ');
        debtor.firstNames = splitName.slice(1).join(' ');
        debtor.lastNames = splitName[0];
        debtors.push(debtor);
        debtorsMap.set(row['DNI'], debtor);
      }

      // Create a new debt
      const debt = new DebtEntity();
      debt.amount = parseFloat(row['Importe']) / 100;
      debt.idDebt = row['Id_adherente'];
      debt.bank = bank;

      // Format date
      const dateString = row['Fecha_vto'].toString();
      const year = parseInt(dateString.slice(0, 4), 10);
      const month = parseInt(dateString.slice(4, 6), 10) - 1;
      const day = parseInt(dateString.slice(6, 8), 10);
      const dueDate = new Date(year, month, day);
      debt.dueDate = dueDate;

      // Set additional properties
      debt.branch = row['Sucursal'];
      debt.accountType = row['Tipo_Cuenta'];
      debt.account = row['Cuenta'];
      debt.currency = row['Moneda'];
      debt.idDebt = row['Id_debito'];
      debt.client = client;
      debt.debtor = debtor;

      // Add the debt to the list to be saved later
      debts.push(debt);
    }

    // Save all entities in DB
    try {
      await this.debtorRepository.save(debtors);
      await this.debtRepository.save(debts);
    } catch (error) {
      console.error('Error saving entities:', error);
      throw new Error('Error processing debt sheet: ' + error.message);
    }
  }

  async getAllDebts(paginationQuery: PaginationQueryDto) {
    const { limit, offset, sortBy, sortOrder, filterBy, filterValue, date, startDate, endDate } =
      paginationQuery;
    let queryBuilder = this.debtRepository.createQueryBuilder('debts');

    if (filterBy && ['idDebt'].includes(filterBy)) {
      const lowerFilterValue = filterValue.toLowerCase();
      queryBuilder = queryBuilder.where(`LOWER(debts.${filterBy}) LIKE :filterValue`, {
        filterValue: `%${lowerFilterValue}%`,
      });
    }

    if (startDate && endDate) {
      if (date && ['createdAt', 'updatedAt', 'dueDate'].includes(date)) {
        queryBuilder = queryBuilder.andWhere(
          `debts.${date} >= :startDate AND debt.${date} <= :endDate`,
          { startDate, endDate }
        );
      } else {
        throw new BadRequestException('Invalid date field specified for filtering');
      }
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
