import { ClientEntity } from 'src/clients/entities/clients.entity';
import { BaseEntity } from 'src/config/base.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { Entity, ManyToOne, Column } from 'typeorm';

@Entity('statistics-payment')
export class StatisticsPaymentEntity extends BaseEntity {
  @ManyToOne(() => ClientEntity, (client) => client.statistics)
  client: ClientEntity;

  @ManyToOne(() => SheetEntity, (sheet) => sheet.statistics)
  sheet: SheetEntity;

  @Column()
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalDebitAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalRemainingDebt: number;
}
