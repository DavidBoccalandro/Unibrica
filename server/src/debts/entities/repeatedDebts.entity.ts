import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/config/base.entity';
import { AccountEntity } from './accounts.entity';
import { DebtSheetsEntity } from './debtSheets.entity';
import { IDebt } from 'src/interfaces/debt.interface';

@Entity({ name: 'repeated-debts' })
export class RepeatedDebtEntity extends BaseEntity implements IDebt {
  @Column()
  idDebt: string;

  @Column()
  dueDate: Date;

  @Column({ type: 'float' })
  amount: number;

  @ManyToOne(() => DebtSheetsEntity, (debtSheet) => debtSheet.debts)
  debtSheet: DebtSheetsEntity;

  @ManyToOne(() => AccountEntity, (account) => account.debts)
  account: AccountEntity;
}
