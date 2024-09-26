import { BaseEntity } from 'src/config/base.entity';
import { IDebtor } from 'src/interfaces/debt.interface';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { DebtEntity } from './debts.entity';
import { RepeatedDebtorEntity } from 'src/repeated-debtor/entities/repeated-debtor.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';

@Entity({ name: 'debtors' })
export class DebtorEntity extends BaseEntity implements IDebtor {
  @Column()
  dni: string;

  @Column()
  firstNames: string;

  @Column()
  lastNames: string;

  @OneToMany(() => DebtEntity, (account) => account.debtor, { nullable: true })
  debts: DebtEntity[];

  @ManyToOne(() => SheetEntity, (sheet) => sheet.debtors)
  sheet: SheetEntity;

  @OneToOne(() => RepeatedDebtorEntity, (repeatedDebtor) => repeatedDebtor.debtor, {
    nullable: true,
  })
  repeatedDebtor: RepeatedDebtorEntity;
}
