import { BaseEntity } from 'src/config/base.entity';
import { IAccount } from 'src/interfaces/debt.interface';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'accounts' })
export class AccountEntity extends BaseEntity implements IAccount {
  @Column()
  branch: number;

  @Column()
  type: number;

  @Column()
  acctNumber: string;

  @Column()
  exchangeType: number;
}
