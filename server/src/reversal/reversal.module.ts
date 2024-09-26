import { Module } from '@nestjs/common';
import { ReversalService } from './services/reversal.service';
import { ReversalController } from './controllers/reversal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReversalRecord } from './entities/reversal.entity';
import { BankEntity } from 'src/banks/entities/banks.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { StatisticsReversalEntity } from 'src/statistics/entities/statisticsReversal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReversalRecord,
      BankEntity,
      SheetEntity,
      ClientEntity,
      StatisticsReversalEntity,
    ]),
  ],
  providers: [ReversalService],
  controllers: [ReversalController],
})
export class ReversalModule {}
