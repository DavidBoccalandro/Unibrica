import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RepeatedDebtorEntity } from '../entities/repeated-debtor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RepeatedDebtorService {
  constructor(
    @InjectRepository(RepeatedDebtorEntity)
    private repeatedDebtorRepository: Repository<RepeatedDebtorEntity>
  ) {}

  async getAllRepeatedDebtors() {
    return await this.repeatedDebtorRepository.find({ relations: { debtor: true } });
  }
}
