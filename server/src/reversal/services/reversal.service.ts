import { Injectable } from '@nestjs/common';
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
    const originalFileName = path.basename(file.originalname, '.lis');

    const sheet = await findOrCreateSheet(originalFileName, this.sheetRepository);

    const processedData = await this.processLines(lines, sheet);

    const filePath = await createExcelFile(processedData, originalFileName);
    console.log('El archivo fue creado en: ', filePath);

    return processedData;
  }

  private async processLines(lines: string[], sheet: SheetsEntity): Promise<ReversalRecord[]> {
    const processedData: ReversalRecord[] = [];

    for (const line of lines) {
      try {
        const reversalRecord = await this.parseLine(line, sheet);
        if (reversalRecord) {
          await this.reversalRecordRepository.save(reversalRecord);
          processedData.push(reversalRecord);
        }
      } catch (error) {
        console.error(`Error processing line: ${line}. Error: ${error.message}`);
      }
    }

    return processedData;
  }

  private async parseLine(line: string, sheet: SheetsEntity): Promise<ReversalRecord | null> {
    const agreementNumber = parseInt(line.substring(1, 6).trim(), 10);
    const serviceNumber = line.substring(6, 16).trim();
    const companyNumber = line.substring(16, 21).trim();
    const bankCode = line.substring(21, 24).trim();
    const branchCode = parseInt(line.substring(24, 28).trim(), 10);
    const accountType = parseInt(line.substring(28, 29).trim(), 10);
    const accountNumber = line.substring(29, 44).trim();
    const currentID = line.substring(44, 66).trim();
    const debitID = line.substring(66, 81).trim();
    const movementFunction = line.substring(81, 83).trim();
    const rejectionCode = line.substring(83, 87).trim();
    const dueDate = parseDate(line.substring(87, 95).trim());
    const debitAmount = parseFloat(line.substring(98, 111).trim()) / 100;

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
    });
  }

  // Obtener todos los registros de reversión
  async findAll(): Promise<ReversalRecord[]> {
    return this.reversalRecordRepository.find({ relations: ['sheet'] });
  }

  // Obtener un registro de reversión por ID
  async findOne(id: number): Promise<ReversalRecord> {
    return this.reversalRecordRepository.findOne({ where: { id } });
  }

  // Actualizar un registro de reversión
  async update(id: number, updateReversalDto: UpdateReversalDto): Promise<ReversalRecord> {
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
