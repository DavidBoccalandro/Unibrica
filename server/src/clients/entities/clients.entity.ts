import { DebtEntity } from 'src/debts/entities/debts.entity';
import { IClient } from 'src/interfaces/client.interfaces';
import { PaymentRecord } from 'src/payment/entities/payment.entity';
import { ReversalRecord } from 'src/reversal/entities/reversal.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';

@Entity({ name: 'clients' })
export class ClientEntity extends BaseEntity implements IClient {
  @Column()
  clientId: number;

  @Column()
  name: string;

  @OneToMany(() => SheetsEntity, (debtSheet) => debtSheet.client, { nullable: true })
  sheets: SheetsEntity[];

  @OneToMany(() => PaymentRecord, (payment) => payment.client, { nullable: true })
  payments: PaymentRecord[];

  @OneToMany(() => ReversalRecord, (reversal) => reversal.client, { nullable: true })
  reversals: ReversalRecord[];

  @OneToMany(() => DebtEntity, (debt) => debt.client, { nullable: true })
  debts: DebtEntity[];
}
