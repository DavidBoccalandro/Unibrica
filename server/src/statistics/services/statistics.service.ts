import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatisticsEntity } from '../entities/statistic.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(StatisticsEntity)
    private readonly statisticsRepository: Repository<StatisticsEntity>
  ) {}

  async getStatistics(
    clientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StatisticsEntity[]> {
    const statistics = await this.statisticsRepository
      .createQueryBuilder('statistics')
      .leftJoinAndSelect('statistics.client', 'client')
      .where('client.clientId = :clientId', { clientId: +clientId })
      .andWhere('statistics.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    return statistics;
  }
}
