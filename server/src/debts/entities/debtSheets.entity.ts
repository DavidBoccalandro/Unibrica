import { ClientEntity } from 'src/clients/entities/clients.entity';
import { BaseEntity } from 'src/config/base.entity';
import { IDebtSheet } from 'src/interfaces/debt.interface';
import { UserEntity } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { DebtEntity } from './debts.entity';
import { BankEntity } from '../../banks/entities/banks.entity';

@Entity({ name: 'debt_sheets' })
export class DebtSheetsEntity extends BaseEntity implements IDebtSheet {
  @Column()
  date: Date;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @OneToMany(() => DebtEntity, (debt) => debt.debtSheet)
  debts: DebtEntity[];

  @ManyToOne(() => UserEntity, (user) => user.debtSheets)
  user: UserEntity;

  @ManyToOne(() => ClientEntity, (client) => client.debtSheets)
  client: ClientEntity;

  @ManyToOne(() => BankEntity, (bank) => bank.debtSheets)
  bank: BankEntity;
}
