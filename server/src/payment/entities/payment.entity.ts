import { BankEntity } from 'src/banks/entities/banks.entity';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { BaseEntity } from 'src/config/base.entity';
import { DebtEntity } from 'src/debts/entities/debts.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity('payment_records')
export class PaymentRecord extends BaseEntity {
  @Column({ type: 'int' })
  recordType: number;

  @Column({ type: 'int' })
  agreementNumber: number;

  @Column({ type: 'int' })
  creditCompany: number;

  @Column({ type: 'varchar' })
  companyAccountNumber: string;

  @Column({ type: 'date' })
  debitDate: Date;

  @Column({ type: 'float' })
  debtAmount: number;

  @ManyToOne(() => BankEntity, (bank) => bank.bankId, { nullable: true })
  bank: BankEntity;

  @Column({ type: 'int' })
  customerAccountType: number;

  @Column({ type: 'int' })
  branchCode: number;

  @Column({ type: 'varchar', length: 15 })
  bankAccountNumber: string;

  @Column({ type: 'int' })
  debitSequence: number;

  @Column({ type: 'int' })
  installmentNumber: number;

  @Column({ type: 'varchar', length: 1 })
  debitStatus: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  rejectCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rejectText: string;

  @Column({ type: 'float' })
  chargedAmount: number;

  @Column({ type: 'float' })
  remainingDebt: number;

  @ManyToOne(() => DebtEntity, (debt) => debt.payments, { nullable: true })
  debt: DebtEntity;

  @ManyToOne(() => SheetEntity, (sheet) => sheet.payments, { nullable: true })
  sheet: SheetEntity;

  @ManyToOne(() => ClientEntity, (client) => client.debts, { nullable: true })
  client: ClientEntity;
}
