import { BaseEntity } from 'src/config/base.entity';
import { DebtorEntity } from 'src/debts/entities/debtors.entity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'repeated-debtors' })
export class RepeatedDebtorEntity extends BaseEntity {
  @OneToOne(() => DebtorEntity, (debtor) => debtor.repeatedDebtor, { nullable: true })
  @JoinColumn()
  debtor: DebtorEntity;
}
