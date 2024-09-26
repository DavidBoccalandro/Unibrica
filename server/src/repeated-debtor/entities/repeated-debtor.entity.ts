import { BaseEntity } from 'src/config/base.entity';
import { DebtorEntity } from 'src/debts/entities/debtors.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { Entity, JoinColumn, JoinTable, ManyToMany, OneToOne } from 'typeorm';

@Entity({ name: 'repeated_debtors' })
export class RepeatedDebtorEntity extends BaseEntity {
  @OneToOne(() => DebtorEntity, (debtor) => debtor.repeatedDebtor, { nullable: true })
  @JoinColumn()
  debtor: DebtorEntity;

  @ManyToMany(() => SheetEntity, (sheet) => sheet.repeatedDebtors)
  @JoinTable()
  sheets: SheetEntity[];
}
