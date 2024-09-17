import { BaseEntity } from 'src/config/base.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { DebtEntity } from '../../debts/entities/debts.entity';
import { PaymentRecord } from 'src/payment/entities/payment.entity';
import { ReversalRecord } from 'src/reversal/entities/reversal.entity';
import { ClientEntity } from '../../clients/entities/clients.entity';
import { RepeatedDebtorEntity } from 'src/repeated-debtor/entities/repeated-debtor.entity';

@Entity({ name: 'sheets' })
export class SheetsEntity extends BaseEntity {
  @Column()
  date: Date;

  @Column()
  fileName: string;

  @OneToMany(() => DebtEntity, (debt) => debt.sheet, { nullable: true })
  debts: DebtEntity[];

  @OneToMany(() => DebtEntity, (debt) => debt.sheet, { nullable: true })
  payments: PaymentRecord[];

  @OneToMany(() => ReversalRecord, (debt) => debt.sheet, { nullable: true })
  reversals: ReversalRecord[];

  @ManyToOne(() => ClientEntity, (client) => client.debts)
  client: ClientEntity;

  @ManyToMany(() => RepeatedDebtorEntity, (debtor) => debtor.sheets, { nullable: true })
  repeatedDebtors: RepeatedDebtorEntity[];
}
