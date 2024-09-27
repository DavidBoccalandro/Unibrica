import { BaseEntity } from 'src/config/base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { DebtEntity } from '../../debts/entities/debts.entity';
import { PaymentRecord } from 'src/payment/entities/payment.entity';
import { ReversalRecord } from 'src/reversal/entities/reversal.entity';
import { ClientEntity } from '../../clients/entities/clients.entity';
import { RepeatedDebtorEntity } from 'src/repeated-debtor/entities/repeated-debtor.entity';
import { DebtorEntity } from 'src/debts/entities/debtors.entity';
import { StatisticsPaymentEntity } from 'src/statistics/entities/statisticsPayment.entity';
import { StatisticsDebtEntity } from 'src/statistics/entities/statisticsDebt.entity';
import { StatisticsReversalEntity } from 'src/statistics/entities/statisticsReversal.entity';

@Entity({ name: 'sheets' })
export class SheetEntity extends BaseEntity {
  @Column()
  date: Date;

  @Column()
  fileName: string;

  @Column({ nullable: true })
  type: string;

  @OneToMany(() => DebtEntity, (debt) => debt.sheet, { nullable: true })
  debts: DebtEntity[];

  @OneToMany(() => PaymentRecord, (payment) => payment.sheet, { nullable: true })
  payments: PaymentRecord[];

  @OneToMany(() => ReversalRecord, (reversal) => reversal.sheet, { nullable: true })
  reversals: ReversalRecord[];

  @ManyToMany(() => ClientEntity, (client) => client.sheets, { nullable: true })
  @JoinTable()
  clients: ClientEntity[];

  @OneToMany(() => DebtorEntity, (debtor) => debtor.sheet, { nullable: true })
  debtors: DebtorEntity[];

  @ManyToMany(() => RepeatedDebtorEntity, (debtor) => debtor.sheets, { nullable: true })
  repeatedDebtors: RepeatedDebtorEntity[];

  @OneToMany(() => StatisticsDebtEntity, (statistic) => statistic.client, { nullable: true })
  debtStatistics: StatisticsDebtEntity[];

  @OneToMany(() => StatisticsPaymentEntity, (statistic) => statistic.client, { nullable: true })
  paymentStatistics: StatisticsPaymentEntity[];

  @OneToMany(() => StatisticsReversalEntity, (statistic) => statistic.client, { nullable: true })
  reversalStatistics: StatisticsReversalEntity[];
}
