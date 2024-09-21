import { ClientEntity } from 'src/clients/entities/clients.entity';
import { BaseEntity } from 'src/config/base.entity';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { Entity, ManyToOne, Column } from 'typeorm';

@Entity()
export class StatisticsEntity extends BaseEntity {
  @ManyToOne(() => ClientEntity, (client) => client.statistics)
  client: ClientEntity;

  @ManyToOne(() => SheetsEntity, (sheet) => sheet.statistics)
  sheet: SheetsEntity;

  @Column()
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalDebitAmount: number;
}
