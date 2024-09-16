import { Module } from '@nestjs/common';
import { RepeatedDebtorController } from './controller/repeated-debtor.controller';
import { RepeatedDebtorService } from './services/repeated-debtor.service';
import { RepeatedDebtorEntity } from './entities/repeated-debtor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtorEntity } from 'src/debts/entities/debtors.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RepeatedDebtorEntity, DebtorEntity])],
  controllers: [RepeatedDebtorController],
  providers: [RepeatedDebtorService],
})
export class RepeatedDebtorModule {}
