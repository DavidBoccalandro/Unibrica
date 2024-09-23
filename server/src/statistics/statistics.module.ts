import { Module } from '@nestjs/common';
import { StatisticsController } from './controller/statistics.controller';
import { StatisticsService } from './services/statistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsEntity } from './entities/statistic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StatisticsEntity])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
