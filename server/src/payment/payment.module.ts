import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankEntity } from 'src/banks/entities/banks.entity';
import { PaymentRecord } from './entities/payment.entity';
import { DebtEntity } from 'src/debts/entities/debts.entity';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { StatisticsPaymentEntity } from 'src/statistics/entities/statisticsPayment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BankEntity,
      PaymentRecord,
      DebtEntity,
      ClientEntity,
      SheetEntity,
      StatisticsPaymentEntity,
    ]),
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
