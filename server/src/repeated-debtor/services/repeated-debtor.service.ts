import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RepeatedDebtorEntity } from '../entities/repeated-debtor.entity';
import { Repository } from 'typeorm';
import { PaginationFilterQueryDto } from 'src/shared/dto/PaginationFIlterQueryDto';

@Injectable()
export class RepeatedDebtorService {
  constructor(
    @InjectRepository(RepeatedDebtorEntity)
    private repeatedDebtorRepository: Repository<RepeatedDebtorEntity>
  ) {}

  async getAllRepeatedDebtors(
    paginationQuery: PaginationFilterQueryDto
  ): Promise<{ repeatedDebtors: RepeatedDebtorEntity[]; totalItems: number }> {
    const { limit, offset, sortBy, sortOrder /* stringFilters, numericFilters, dateFilters */ } =
      paginationQuery;
    let queryBuilder = this.repeatedDebtorRepository
      .createQueryBuilder('repeated_debtors')
      .leftJoinAndSelect('repeated_debtors.debtor', 'debtor')
      .leftJoinAndSelect('repeated_debtors.sheets', 'sheets')
      .leftJoinAndSelect('sheets.client', 'client');
    // .leftJoinAndSelect('sheets.bank', 'bank')
    // .leftJoinAndSelect('sheets.sheet', 'sheet')

    // Ejecuta la consulta para obtener el total de elementos
    const totalItems = await queryBuilder.getCount();

    if (!sortBy || !sortOrder) {
      const order = {};
      order['repeated_debtors.updated_at'] = 'DESC';
      queryBuilder = queryBuilder.orderBy(order);
    }

    if (limit) {
      queryBuilder = queryBuilder.limit(limit).offset(offset ?? 0);
    }

    const repeatedDebtors = await queryBuilder.getMany();

    return { repeatedDebtors, totalItems };
  }
}
