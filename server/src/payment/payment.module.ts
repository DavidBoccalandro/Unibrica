import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankEntity } from 'src/banks/entities/banks.entity';
import { PaymentRecord } from './entities/payment.entity';
import { DebtEntity } from 'src/debts/entities/debts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BankEntity, PaymentRecord, DebtEntity])],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
