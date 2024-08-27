import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PaymentRecord } from '../entities/payment.entity';
import { BankEntity } from 'src/banks/entities/banks.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,

    @InjectRepository(BankEntity)
    private bankRepository: Repository<BankEntity>
  ) {}

  async uploadPaymentSheet(file: Express.Multer.File): Promise<PaymentRecord[]> {
    if (!file) {
      throw new Error('No file provided');
    }
    //! Al trabajar con Angular, de-comentar las lineas 24-25 y comentar la 26
    // const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    // const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fileContent = file.buffer.toString('utf-8');
    const lines = fileContent.split('\n');

    const processedData: PaymentRecord[] = [];

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

        const subscriberID = parseInt(line.substring(49, 60).trim(), 10);
        const bankCode = line.substring(60, 63).trim();
        const customerAccountType = parseInt(line.substring(63, 64).trim(), 10);
        const branchCode = parseInt(line.substring(64, 67).trim(), 10);
        const bankAccountNumber = line.substring(67, 82).trim();
        const debitSequence = parseInt(line.substring(83, 85).trim(), 10);
        const installmentNumber = parseInt(line.substring(85, 87).trim(), 10);
        const debitStatus = line.substring(87, 88).trim();
        const chargedAmount = parseInt(line.substring(108, 119).trim());

        if (
          isNaN(recordType) ||
          isNaN(agreementNumber) ||
          isNaN(creditCompany) ||
          isNaN(subscriberID) ||
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

        // Buscar o crear el banco
        let bank = await this.bankRepository.findOne({ where: { bankId: bankCode } });
        if (!bank) {
          bank = this.bankRepository.create({ bankId: bankCode, name: 'Unknown Bank' });
          await this.bankRepository.save(bank);
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
        });

        await this.paymentRecordRepository.save(paymentRecord);
        processedData.push(paymentRecord);
      } catch (error) {
        console.error(`Error processing line: ${line}. Error: ${error.message}`);
        continue;
      }
    }

    return processedData;
  }

  async findAll(): Promise<PaymentRecord[]> {
    return this.paymentRecordRepository.find({ relations: ['bank'] });
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
}
