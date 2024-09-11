import { BaseEntity } from 'src/config/base.entity';
import { IDebtor } from 'src/interfaces/debt.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { DebtEntity } from './debts.entity';

@Entity({ name: 'debtors' })
export class DebtorEntity extends BaseEntity implements IDebtor {
  @Column()
  dni: string;

  @Column()
  firstNames: string;

  @Column()
  lastNames: string;

  @OneToMany(() => DebtEntity, (account) => account.debtor, { nullable: true })
  debts: DebtEntity[];
}
