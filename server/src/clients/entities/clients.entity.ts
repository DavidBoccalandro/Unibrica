import { DebtEntity } from 'src/debts/entities/debts.entity';
import { IClient } from 'src/interfaces/client.interfaces';
import { PaymentRecord } from 'src/payment/entities/payment.entity';
import { ReversalRecord } from 'src/reversal/entities/reversal.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { StatisticsPaymentEntity } from 'src/statistics/entities/statisticsPayment.entity';
import { StatisticsDebtEntity } from 'src/statistics/entities/statisticsDebt.entity';
import { StatisticsReversalEntity } from 'src/statistics/entities/statisticsReversal.entity';

@Entity({ name: 'clients' })
export class ClientEntity extends BaseEntity implements IClient {
  @Column()
  agreementNumber: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @ManyToMany(() => SheetEntity, (sheet) => sheet.clients, { nullable: true })
  sheets: SheetEntity[];

  @OneToMany(() => PaymentRecord, (payment) => payment.client, { nullable: true })
  payments: PaymentRecord[];

  @OneToMany(() => ReversalRecord, (reversal) => reversal.client, { nullable: true })
  reversals: ReversalRecord[];

  @OneToMany(() => DebtEntity, (debt) => debt.client, { nullable: true })
  debts: DebtEntity[];

  @OneToMany(() => StatisticsPaymentEntity, (statistic) => statistic.client, { nullable: true })
  paymentStatistics: StatisticsPaymentEntity[];

  @OneToMany(() => StatisticsDebtEntity, (statistic) => statistic.client, { nullable: true })
  debtStatistics: StatisticsDebtEntity[];

  @OneToMany(() => StatisticsReversalEntity, (statistic) => statistic.client, { nullable: true })
  reversalStatistics: StatisticsReversalEntity[];
}
