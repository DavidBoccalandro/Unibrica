import { BaseEntity } from 'src/config/base.entity';
import { IDebt } from 'src/interfaces/debt.interface';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BankEntity } from 'src/banks/entities/banks.entity';
import { PaymentRecord } from 'src/payment/entities/payment.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';

@Entity({ name: 'debts' })
export class DebtEntity extends BaseEntity implements IDebt {
  @ManyToOne(() => BankEntity, (bank) => bank.debts)
  bank: BankEntity;

  @Column({ type: 'int' })
  branch: number;

  @Column({ type: 'int' })
  accountType: number;

  @Column({ type: 'varchar', length: 50 })
  account: string;

  @Column({ type: 'varchar', length: 50 })
  idDebt: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'float' })
  amount: number;

  @ManyToOne(() => SheetsEntity, (debtSheet) => debtSheet.debts)
  debtSheet: SheetsEntity;

  @OneToMany(() => PaymentRecord, (payment) => payment.debt)
  payments: PaymentRecord;
}
