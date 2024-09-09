import { BaseEntity } from 'src/config/base.entity';
import { IDebtor } from 'src/interfaces/debt.interface';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { DebtEntity } from './debts.entity';
import { AccountEntity } from './accounts.entity';

@Entity({ name: 'debtors' })
export class DebtorEntity extends BaseEntity implements IDebtor {
  @Column()
  dni: string;

  @Column()
  idDebtor: string;

  // @Column()
  // firstNames: string;

  // @Column()
  // lastNames: string;

  @OneToMany(() => AccountEntity, (account) => account.debtor)
  accounts: AccountEntity[];

  // @OneToMany(() => DebtEntity, (account) => account.debtor)
  // debts: DebtEntity[];
}
