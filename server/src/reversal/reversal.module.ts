import { Module } from '@nestjs/common';
import { ReversalService } from './services/reversal.service';
import { ReversalController } from './controllers/reversal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReversalRecord } from './entities/reversal.entity';
import { BankEntity } from 'src/banks/entities/banks.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReversalRecord, BankEntity, SheetsEntity])],
  providers: [ReversalService],
  controllers: [ReversalController],
})
export class ReversalModule {}
