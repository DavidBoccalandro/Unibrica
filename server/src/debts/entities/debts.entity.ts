import { BaseEntity } from 'src/config/base.entity';
import { IDebt } from 'src/interfaces/debt.interface';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BankEntity } from 'src/banks/entities/banks.entity';
import { PaymentRecord } from 'src/payment/entities/payment.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { DebtorEntity } from './debtors.entity';

@Entity({ name: 'debts' })
export class DebtEntity extends BaseEntity implements IDebt {
  @ManyToOne(() => BankEntity, (bank) => bank.debts, { nullable: true })
  bank: BankEntity;

  @Column({ type: 'int' })
  branchCode: number;

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
  sheet: SheetsEntity;

  @OneToMany(() => PaymentRecord, (payment) => payment.debt, { nullable: true })
  payments: PaymentRecord[];

  @ManyToOne(() => ClientEntity, (client) => client.debts, { nullable: true })
  client: ClientEntity;

  @ManyToOne(() => DebtorEntity, (debtor) => debtor.debts)
  debtor: DebtorEntity;
}
