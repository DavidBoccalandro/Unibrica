import { Module } from '@nestjs/common';
import { StatisticsController } from './controller/statistics.controller';
import { StatisticsService } from './services/statistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsPaymentEntity } from './entities/statisticsPayment.entity';
import { StatisticsDebtEntity } from './entities/statisticsDebt.entity';
import { StatisticsReversalEntity } from './entities/statisticsReversal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StatisticsPaymentEntity,
      StatisticsDebtEntity,
      StatisticsReversalEntity,
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
