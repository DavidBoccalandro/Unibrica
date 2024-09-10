import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankEntity } from '../entities/banks.entity';
import { Repository } from 'typeorm';
import { ErrorManager } from 'src/utils/error.manager';
import { BankDTO } from '../dto/bank.dto';

@Injectable()
export class BanksService {
  constructor(
    @InjectRepository(BankEntity) private readonly bankRepository: Repository<BankEntity>
  ) {}

  public async getAllBanks(): Promise<BankEntity[]> {
    try {
      const banks: BankEntity[] = await this.bankRepository.find();
      return banks;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async createBank(bank: BankDTO): Promise<BankEntity> {
    try {
      const newBank: BankEntity = await this.bankRepository.create(bank);
      await this.bankRepository.save(newBank);
      return newBank;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
