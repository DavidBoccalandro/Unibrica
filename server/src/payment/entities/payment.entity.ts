import { BankEntity } from 'src/banks/entities/banks.entity';
import { DebtEntity } from 'src/debts/entities/debts.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('payment_records')
export class PaymentRecord {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'varchar' })
  subscriberID: string;

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

  @Column({ type: 'float' })
  chargedAmount: number;

  @ManyToOne(() => DebtEntity, (debt) => debt.payments, { nullable: true })
  debt: DebtEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
