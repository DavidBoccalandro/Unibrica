import { Module } from '@nestjs/common';
import { StatisticsController } from './controller/statistics.controller';
import { StatisticsService } from './services/statistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsPaymentEntity } from './entities/statisticsPayment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StatisticsPaymentEntity])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
