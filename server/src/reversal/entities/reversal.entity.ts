import { BankEntity } from 'src/banks/entities/banks.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reversal_records')
export class ReversalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  agreementNumber: number;

  @Column()
  serviceNumber: string;

  @Column()
  companyNumber: string;

  @ManyToOne(() => BankEntity)
  bank: BankEntity;

  @Column()
  branchCode: number;

  @Column()
  accountType: number;

  @Column()
  accountNumber: string;

  @Column()
  currentID: string;

  @Column({ type: 'varchar', length: 15 })
  debitID: string;

  @Column({ type: 'varchar', length: 2 })
  movementFunction: string;

  @Column({ type: 'varchar', length: 4 })
  rejectionCode: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 13, scale: 2 })
  debitAmount: number;

  @ManyToOne(() => SheetsEntity, (sheet) => sheet.reversals)
  sheet: SheetsEntity;
}
