import { InjectRepository } from '@nestjs/typeorm';
import * as XLSX from 'xlsx';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DebtorEntity } from '../entities/debtors.entity';
import { AccountEntity } from '../entities/accounts.entity';
import { UserEntity } from 'src/users/entities/users.entity';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { BankEntity } from '../../banks/entities/banks.entity';
import { DebtEntity } from '../entities/debts.entity';
import { PaginationQueryDto } from '../controllers/debts.controller';
import { RepeatedDebtEntity } from '../entities/repeatedDebts.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(SheetsEntity)
    private readonly sheetRepository: Repository<SheetsEntity>,
    @InjectRepository(DebtorEntity) private readonly debtorRepository: Repository<DebtorEntity>,
    @InjectRepository(DebtEntity) private readonly debtRepository: Repository<DebtEntity>,
    @InjectRepository(AccountEntity) private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ClientEntity) private readonly clientEntity: Repository<ClientEntity>,
    @InjectRepository(BankEntity) private readonly bankEntity: Repository<BankEntity>,
    @InjectRepository(RepeatedDebtEntity)
    private readonly repeatedDebtRepository: Repository<RepeatedDebtEntity>
  ) {}

  public async uploadDebtSheet(
    file: Express.Multer.File,
    userId: string,
    bankId: string
  ): Promise<string> {
    try {
      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(sheet);

      const blockSize = 200; // Tamaño del bloque
      for (let startRow = 1; startRow < excelData.length; startRow += blockSize) {
        const endRow = Math.min(startRow + blockSize, excelData.length);
        const blockData = excelData.slice(startRow, endRow);
        await this.processDebtSheet(blockData);
      }

      return 'Debt sheet uploaded successfully, and it is being processed.';
    } catch (error) {
      throw new Error('Error uploading debt sheet: ' + error.message);
    }
  }

  /*
   * Function to process de file
   */
  public async processDebtSheet(excelData: any) {
    const debtors: DebtorEntity[] = [];
    const accounts: AccountEntity[] = [];
    const debts: DebtEntity[] = [];
    const repeatedDebts: RepeatedDebtEntity[] = [];

    for (const row of excelData) {
      // Check if debt exists
      const existingDebt = await this.debtRepository.findOne({
        where: { idDebt: row['Id_adherente'] },
      });

      if (existingDebt) {
        // If debt exist, it stores it
        const repeatedDebt = new RepeatedDebtEntity();
        repeatedDebt.idDebt = existingDebt.idDebt;
        repeatedDebt.dueDate = existingDebt.dueDate;
        repeatedDebt.amount = existingDebt.amount;
        repeatedDebt.account = existingDebt.account;
        repeatedDebts.push(repeatedDebt);
        continue;
      } else {
        // Check if debtor exits
        let debtor = await this.debtorRepository.findOne({
          where: { dni: row['DNI'] },
          relations: ['debts'],
        });

        // If debtor doesn't exist, creates it
        if (!debtor && row['DNI']) {
          debtor = new DebtorEntity();
          debtor.dni = row['DNI'];
          debtor.firstNames = row['NOMBRES'] ? row['NOMBRES'].toUpperCase() : '';
          debtor.lastNames = row['APELLIDOS'] ? row['APELLIDOS'].toUpperCase() : '';
          debtor.debts = []; // Inicializar la lista de deudas
          debtors.push(debtor);
        }

        // Check if account exists
        let account = await this.accountRepository.findOne({
          where: { acctNumber: row['Cuenta'] },
        });

        // If account doesn't exists, it creates it
        if (!account) {
          account = new AccountEntity();
          account.acctNumber = row['Cuenta'];
          account.branch = row['Sucursal'];
          account.exchangeType = row['Moneda'];
          account.type = row['Tipo_cuenta'];
          account.debtor = debtor;
          accounts.push(account);
        }

        // Create a new debt
        const debt = new DebtEntity();
        debt.amount = parseFloat(row['Importe']) / 100;
        debt.idDebt = row['Id_adherente'];

        // Format date
        const dateString = row['Fecha_vto'];
        const year = parseInt(dateString.slice(0, 4), 10);
        const month = parseInt(dateString.slice(4, 6), 10) - 1;
        const day = parseInt(dateString.slice(6, 8), 10);
        const dueDate = new Date(year, month, day);
        debt.dueDate = dueDate;

        debt.account = account;
        debt.debtor = debtor;
        debt.isPaid = false;
        debts.push(debt);

        // Add debt to debtor
        debtor.debts.push(debt);
      }
    }

    // Save all entities in DB
    await Promise.all([
      this.debtorRepository.save(debtors),
      this.accountRepository.save(accounts),
      this.debtRepository.save(debts),
      this.repeatedDebtRepository.save(repeatedDebts),
    ]);
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

    // It return debts and total amount of item
    return { debts, totalItems };
  }
}

// {
//     'N°empresa sueldo': 0,
//     Tipo_Banco: 285,
//     Sucursal: 202,
//     Tipo_cuenta: 4,
//     Cuenta: 420209464635995,
//     Id_adherente: '2850202340094646359958',
//     Id_debito: 'LETRAS_EN_MAYÚSCULA',
//     Fecha_vto: 20230914,
//     Moneda: 80,
//     Importe: 4500000,
//     DNI: 25780292,
//     NOMBRES: 'VELAZQUEZ MARIA CRISTINA',
//     APELLIDOS: 'VELAZQUEZ MARIA CRISTINA',
//     dni: 1120346,
//     score: 0.07566826578979396
//   },
