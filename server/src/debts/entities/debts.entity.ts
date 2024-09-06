import { BaseEntity } from 'src/config/base.entity';
import { IDebt } from 'src/interfaces/debt.interface';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AccountEntity } from './accounts.entity';
import { DebtorEntity } from '../entities/debtors.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';

@Entity({ name: 'debts' })
export class DebtEntity extends BaseEntity implements IDebt {
  @Column()
  idDebt: string;

  @Column()
  dueDate: Date;

  @Column({ type: 'float' })
  amount: number;

  @ManyToOne(() => SheetsEntity, (debtSheet) => debtSheet.debts)
  debtSheet: SheetsEntity;

  @ManyToOne(() => AccountEntity, (account) => account.debts)
  account: AccountEntity;

  @ManyToOne(() => DebtorEntity, (debtor) => debtor.debts)
  debtor: DebtorEntity;

  @Column()
  isPaid: boolean;
}
