import { BaseEntity } from 'src/config/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

import { IBank } from 'src/interfaces/bank.interfaces';
import { PaymentRecord } from 'src/payment/entities/payment.entity';

@Entity({ name: 'banks' })
export class BankEntity extends BaseEntity implements IBank {
  @Column()
  bankId: string;

  @Column()
  name: string;

  @OneToMany(() => PaymentRecord, (paymentRecord) => paymentRecord.bank, { nullable: true })
  paymentRecords: PaymentRecord[];
}
