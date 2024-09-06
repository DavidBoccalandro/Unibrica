import { ClientEntity } from 'src/clients/entities/clients.entity';
import { BaseEntity } from 'src/config/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { DebtEntity } from '../../debts/entities/debts.entity';
import { PaymentRecord } from 'src/payment/entities/payment.entity';
import { ReversalRecord } from 'src/reversal/entities/reversal.entity';

@Entity({ name: 'sheets' })
export class SheetsEntity extends BaseEntity {
  @Column()
  date: Date;

  @Column()
  fileName: string;

  @OneToMany(() => DebtEntity, (debt) => debt.debtSheet, { nullable: true })
  debts: DebtEntity[];

  @OneToMany(() => DebtEntity, (debt) => debt.debtSheet, { nullable: true })
  payments: PaymentRecord[];

  @OneToMany(() => DebtEntity, (debt) => debt.debtSheet, { nullable: true })
  reversals: ReversalRecord[];

  @ManyToOne(() => ClientEntity, (client) => client.debtSheets)
  client: ClientEntity;
}
