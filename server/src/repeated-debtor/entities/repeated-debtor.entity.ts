import { BaseEntity } from 'src/config/base.entity';
import { DebtorEntity } from 'src/debts/entities/debtors.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { Entity, JoinColumn, JoinTable, ManyToMany, OneToOne } from 'typeorm';

@Entity({ name: 'repeated_debtors' })
export class RepeatedDebtorEntity extends BaseEntity {
  @OneToOne(() => DebtorEntity, (debtor) => debtor.repeatedDebtor, { nullable: true })
  @JoinColumn()
  debtor: DebtorEntity;

  @ManyToMany(() => SheetsEntity, (sheet) => sheet.repeatedDebtors)
  @JoinTable()
  sheets: SheetsEntity[];
}
