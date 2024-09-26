import { BaseEntity } from 'src/config/base.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { DebtEntity } from '../../debts/entities/debts.entity';
import { PaymentRecord } from 'src/payment/entities/payment.entity';
import { ReversalRecord } from 'src/reversal/entities/reversal.entity';
import { ClientEntity } from '../../clients/entities/clients.entity';
import { RepeatedDebtorEntity } from 'src/repeated-debtor/entities/repeated-debtor.entity';
import { DebtorEntity } from 'src/debts/entities/debtors.entity';
import { StatisticsPaymentEntity } from 'src/statistics/entities/statisticsPayment.entity';

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

  @OneToMany(() => DebtEntity, (debt) => debt.sheet, { nullable: true })
  payments: PaymentRecord[];

  @OneToMany(() => ReversalRecord, (debt) => debt.sheet, { nullable: true })
  reversals: ReversalRecord[];

  @ManyToOne(() => ClientEntity, (client) => client.debts)
  client: ClientEntity;

  @OneToMany(() => DebtorEntity, (debtor) => debtor.sheet, { nullable: true })
  debtors: DebtorEntity[];

  @ManyToMany(() => RepeatedDebtorEntity, (debtor) => debtor.sheets, { nullable: true })
  repeatedDebtors: RepeatedDebtorEntity[];

  @OneToMany(() => StatisticsPaymentEntity, (statistic) => statistic.sheet)
  statistics: StatisticsPaymentEntity[];
}
